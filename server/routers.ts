import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { civicCategories, civicPriorities, civicStatuses } from "../drizzle/schema";
import {
  addCivicItemUpdate,
  assignCivicItem,
  changeCivicItemStatus,
  createCivicItem,
  createCivicNotification,
  getAllUpdates,
  getCitizenProfile,
  getConsentSummary,
  getDrfiAssessment,
  getCivicItemByPublicId,
  getCivicStats,
  getMapCivicItems,
  getPublicUpdates,
  listCitizenCivicItems,
  listCivicNotifications,
  listOperationsCivicItems,
  listPublicCivicItems,
  listTriageInsights,
  markCivicNotificationRead,
  recordConsents,
  saveCitizenProfile,
  saveDrfiAssessment,
  saveTriageInsight,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import { canTransitionCivicStatus, statusNotificationTitle } from "./civicLifecycle";

const publicIdInput = z.object({ publicId: z.string().regex(/^JN-[A-Z0-9_-]{6,24}$/) });
const createItemInput = z.object({
  title: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(3000),
  category: z.enum(civicCategories),
  locationLabel: z.string().trim().min(3).max(240),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  sourceChannel: z.enum(["web", "whatsapp", "sms", "telegram", "ivrs", "field_worker", "social"]).default("web"),
  contentType: z.enum(["text", "voice", "image", "mixed"]).default("text"),
});

const triageOutput = z.object({
  suggestedTitle: z.string().min(4).max(160),
  suggestedCategory: z.enum(civicCategories),
  suggestedPriority: z.enum(civicPriorities),
  summary: z.string().min(12).max(500),
  rationale: z.string().min(12).max(500),
  confidence: z.number().int().min(0).max(100),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    mine: protectedProcedure.query(({ ctx }) => getCitizenProfile(ctx.user.id)),
    save: protectedProcedure.input(z.object({
      locality: z.string().max(160).nullable().optional(),
      ward: z.string().max(120).nullable().optional(),
      district: z.string().max(120).nullable().optional(),
      inAppNotifications: z.boolean().optional(),
    })).mutation(({ ctx, input }) => saveCitizenProfile({ userId: ctx.user.id, ...input })),
    consent: protectedProcedure.query(({ ctx }) => getConsentSummary(ctx.user.id)),
    acceptPlatform: protectedProcedure.input(z.object({ publicActivity: z.boolean() }))
      .mutation(({ ctx, input }) => recordConsents(ctx.user.id, input.publicActivity)),
  }),
  civicItems: router({
    publicList: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(60).default(24) }).optional())
      .query(({ input }) => listPublicCivicItems(input?.limit ?? 24)),
    publicDetail: publicProcedure.input(publicIdInput).query(async ({ input }) => {
      const item = await getCivicItemByPublicId(input.publicId);
      if (!item || item.visibility !== "public") throw new TRPCError({ code: "NOT_FOUND" });
      return { item, updates: await getPublicUpdates(item.id), insights: await listTriageInsights(item.id) };
    }),
    mine: protectedProcedure.query(({ ctx }) => listCitizenCivicItems(ctx.user.id)),
    mapActivity: publicProcedure.query(() => getMapCivicItems()),
    stats: publicProcedure.query(() => getCivicStats()),
    create: protectedProcedure.input(createItemInput).mutation(async ({ ctx, input }) => {
      const created = await createCivicItem({ citizenId: ctx.user.id, ...input });
      await createCivicNotification({
        recipientId: ctx.user.id,
        civicItemId: created.civicItemId,
        type: "receipt",
        title: "Your civic request has been received",
        message: `${created.publicId}: coordinators can now review the record and post updates.` ,
      });
      void notifyOwner({
        title: "New Jananiti report received",
        content: `${created.publicId}: ${input.title}`,
      });
      return created;
    }),
  }),
  notifications: router({
    mine: protectedProcedure.query(({ ctx }) => listCivicNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number().int() }))
      .mutation(({ ctx, input }) => markCivicNotificationRead(input.id, ctx.user.id)),
  }),
  operations: router({
    queue: adminProcedure.query(() => listOperationsCivicItems()),
    itemDetail: adminProcedure.input(publicIdInput).query(async ({ input }) => {
      const item = await getCivicItemByPublicId(input.publicId);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return { item, updates: await getAllUpdates(item.id), insights: await listTriageInsights(item.id), drfi: await getDrfiAssessment(item.id) };
    }),
    assign: adminProcedure.input(publicIdInput.extend({
      coordinatorId: z.number().int().positive(),
      message: z.string().trim().min(8).max(500),
    })).mutation(async ({ ctx, input }) => {
      const item = await assignCivicItem({
        publicId: input.publicId,
        coordinatorId: input.coordinatorId,
        actorId: ctx.user.id,
        message: input.message,
      });
      await createCivicNotification({
        recipientId: item.citizenId,
        civicItemId: item.id,
        type: "assignment",
        title: "A coordinator has been assigned",
        message: input.message,
      });
      await createCivicNotification({
        recipientId: input.coordinatorId,
        civicItemId: item.id,
        type: "assignment",
        title: "A civic item has been assigned to you",
        message: `${input.publicId}: ${item.title}`,
      });
      return { success: true };
    }),
    changeStatus: adminProcedure.input(publicIdInput.extend({
      status: z.enum(civicStatuses),
      message: z.string().trim().min(8).max(750),
      isPublic: z.boolean().default(true),
    })).mutation(async ({ ctx, input }) => {
      const current = await getCivicItemByPublicId(input.publicId);
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });
      if (!canTransitionCivicStatus(current.status, input.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This status transition is not permitted." });
      }
      const item = await changeCivicItemStatus({ ...input, actorId: ctx.user.id });
      await createCivicNotification({
        recipientId: item.citizenId,
        civicItemId: item.id,
        type: input.status === "resolved" ? "resolution" : "status",
        title: statusNotificationTitle(input.status),
        message: input.message,
      });
      return { success: true };
    }),
    addUpdate: adminProcedure.input(publicIdInput.extend({
      message: z.string().trim().min(8).max(750),
      isPublic: z.boolean().default(true),
    })).mutation(async ({ ctx, input }) => {
      const item = await addCivicItemUpdate({ ...input, actorId: ctx.user.id });
      await createCivicNotification({
        recipientId: item.citizenId,
        civicItemId: item.id,
        type: "update",
        title: "There is a new update on your request",
        message: input.message,
      });
      return { success: true };
    }),
  }),
  drfi: router({
    get: adminProcedure.input(publicIdInput).query(async ({ input }) => {
      const item = await getCivicItemByPublicId(input.publicId);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return getDrfiAssessment(item.id);
    }),
    assess: adminProcedure.input(publicIdInput.extend({
      demand: z.number().int().min(0).max(100), populationImpact: z.number().int().min(0).max(100), infrastructureGap: z.number().int().min(0).max(100), serviceAccess: z.number().int().min(0).max(100), budgetFeasibility: z.number().int().min(0).max(100), geospatialReality: z.number().int().min(0).max(100), trendGrowth: z.number().int().min(0).max(100), riskUrgency: z.number().int().min(0).max(100), evidenceNotes: z.string().trim().min(16).max(2000),
    })).mutation(async ({ ctx, input }) => {
      const item = await getCivicItemByPublicId(input.publicId);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      const { publicId: _publicId, ...factors } = input;
      return saveDrfiAssessment({ civicItemId: item.id, reviewedById: ctx.user.id, ...factors });
    }),
  }),
  triage: router({
    suggest: adminProcedure.input(publicIdInput).mutation(async ({ input }) => {
      const item = await getCivicItemByPublicId(input.publicId);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      const catalog = await listLLMModels();
      const model = catalog.data.find(entry => entry.id === "gemini-3-flash-preview")?.id;
      if (!model) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Gemini triage is not available right now." });

      const response = await invokeLLM({
        model,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: "You assist a civic coordinator. Return a cautious structured draft only. Do not make factual claims beyond the citizen report, do not identify a person, and do not state that an issue is resolved.",
          },
          {
            role: "user",
            content: `Title: ${item.title}\nCategory selected by citizen: ${item.category}\nReport: ${item.description}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "civic_triage_draft",
            strict: true,
            schema: {
              type: "object",
              properties: {
                suggestedTitle: { type: "string" },
                suggestedCategory: { type: "string", enum: civicCategories },
                suggestedPriority: { type: "string", enum: civicPriorities },
                summary: { type: "string" },
                rationale: { type: "string" },
                confidence: { type: "integer", minimum: 0, maximum: 100 },
              },
              required: ["suggestedTitle", "suggestedCategory", "suggestedPriority", "summary", "rationale", "confidence"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = response.choices[0]?.message.content;
      if (typeof raw !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The triage service returned an unexpected response." });
      const insight = triageOutput.parse(JSON.parse(raw));
      await saveTriageInsight({ civicItemId: item.id, model, ...insight });
      return insight;
    }),
  }),
});

export type AppRouter = typeof appRouter;
