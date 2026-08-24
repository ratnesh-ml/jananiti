import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import {
  civicAttachments,
  civicReactions,
  civicVerifications,
  citizenBadges,
  consentRecords,
  citizenProfiles,
  civicItemUpdates,
  civicItems,
  civicNotifications,
  localVerificationAlerts,
  drfiAssessments,
  type CivicCategory,
  type CivicPriority,
  type CivicStatus,
  type InsertUser,
  triageInsights,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { calculateDrfi } from "./drfiMath";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function ensureDb<T>(db: T): asserts db is Exclude<T, null> {
  if (!db) throw new Error("Database is unavailable");
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getCitizenProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(citizenProfiles).where(eq(citizenProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function saveCitizenProfile(input: {
  userId: number;
  locality?: string | null;
  ward?: string | null;
  district?: string | null;
  inAppNotifications?: boolean;
}) {
  const db = await getDb();
  ensureDb(db);
  await db.insert(citizenProfiles).values({
    userId: input.userId,
    locality: input.locality ?? null,
    ward: input.ward ?? null,
    district: input.district ?? null,
    inAppNotifications: input.inAppNotifications ?? true,
  }).onDuplicateKeyUpdate({
    set: {
      locality: input.locality ?? null,
      ward: input.ward ?? null,
      district: input.district ?? null,
      inAppNotifications: input.inAppNotifications ?? true,
    },
  });
  return getCitizenProfile(input.userId);
}

export async function recordConsents(userId: number, publicActivity: boolean) {
  const db = await getDb();
  ensureDb(db);
  await db.insert(consentRecords).values([
    { userId, type: "platform", version: "v1" },
    { userId, type: "public_activity", version: "v1", withdrawnAt: publicActivity ? null : new Date() },
  ]);
}

export async function getConsentSummary(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(consentRecords).where(eq(consentRecords.userId, userId));
}

export async function createCivicItem(input: {
  citizenId: number;
  category: CivicCategory;
  title: string;
  description: string;
  locationLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  locality?: string | null;
  visibility: "public" | "private";
  sourceChannel: "web" | "whatsapp" | "sms" | "telegram" | "ivrs" | "field_worker" | "social";
  contentType: "text" | "voice" | "image" | "mixed";
}) {
  const db = await getDb();
  ensureDb(db);
  const publicId = `JN-${nanoid(8).toUpperCase()}`;
  const [result] = await db.insert(civicItems).values({
    publicId,
    citizenId: input.citizenId,
    category: input.category,
    title: input.title,
    description: input.description,
    locationLabel: input.locationLabel,
    locality: input.locality ?? null,
    latitude: input.latitude == null ? null : input.latitude.toFixed(7),
    longitude: input.longitude == null ? null : input.longitude.toFixed(7),
    visibility: input.visibility,
    sourceChannel: input.sourceChannel,
    contentType: input.contentType,
  });
  const civicItemId = Number(result.insertId);

  await db.insert(civicItemUpdates).values({
    civicItemId,
    actorId: input.citizenId,
    eventType: "received",
    nextStatus: "submitted",
    message: "Your request has been received and is awaiting coordinator review.",
    isPublic: input.visibility === "public",
  });
  await db.insert(civicNotifications).values({
    recipientId: input.citizenId,
    civicItemId,
    type: "receipt",
    title: "Request received",
    message: `${publicId} has been received and is ready for review.`,
  });
  await db.insert(citizenBadges).values({
    userId: input.citizenId,
    badge: "first_report",
    rationale: "Submitted a first civic report.",
  }).onDuplicateKeyUpdate({ set: { rationale: "Submitted a first civic report." } });

  return { civicItemId, publicId };
}

export async function getCivicItemByPublicId(publicId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(civicItems).where(eq(civicItems.publicId, publicId)).limit(1);
  return result[0];
}

export async function listPublicCivicItems(limit = 24) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicItems)
    .where(eq(civicItems.visibility, "public"))
    .orderBy(desc(civicItems.createdAt))
    .limit(limit);
}

export async function getCommunitySignals(civicItemId: number, viewerId?: number) {
  const db = await getDb();
  if (!db) return { up: 0, down: 0, confirm: 0, dispute: 0, unableToVerify: 0, viewerReaction: null as "up" | "down" | null, viewerVerification: null as "confirm" | "dispute" | "unable_to_verify" | null };
  const [reactions, verifications] = await Promise.all([
    db.select().from(civicReactions).where(eq(civicReactions.civicItemId, civicItemId)),
    db.select().from(civicVerifications).where(eq(civicVerifications.civicItemId, civicItemId)),
  ]);
  return {
    up: reactions.filter(entry => entry.reaction === "up").length,
    down: reactions.filter(entry => entry.reaction === "down").length,
    confirm: verifications.filter(entry => entry.response === "confirm").length,
    dispute: verifications.filter(entry => entry.response === "dispute").length,
    unableToVerify: verifications.filter(entry => entry.response === "unable_to_verify").length,
    viewerReaction: viewerId ? reactions.find(entry => entry.userId === viewerId)?.reaction ?? null : null,
    viewerVerification: viewerId ? verifications.find(entry => entry.userId === viewerId)?.response ?? null : null,
  };
}

export async function listCommunityFeed(viewerId?: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  const profile = viewerId ? await getCitizenProfile(viewerId) : undefined;
  const items = profile?.locality
    ? await db.select().from(civicItems).where(and(eq(civicItems.visibility, "public"), eq(civicItems.locality, profile.locality))).orderBy(desc(civicItems.createdAt)).limit(limit)
    : await listPublicCivicItems(limit);
  return Promise.all(items.map(async item => {
    const attachments = await listCivicAttachments(item.id);
    const image = attachments.find(attachment => attachment.kind === "image");
    return {
      ...item,
      signals: await getCommunitySignals(item.id, viewerId),
      evidence: image ? { kind: image.kind, originalName: image.originalName, url: `/manus-storage/${image.storageKey}` } : null,
      attachments: attachments.map(attachment => ({
        id: attachment.id,
        kind: attachment.kind,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        url: `/manus-storage/${attachment.storageKey}`,
      })),
      attachmentCount: attachments.length,
    };
  }));
}

export async function setCivicReaction(input: { civicItemId: number; userId: number; reaction: "up" | "down" }) {
  const db = await getDb(); ensureDb(db);
  await db.insert(civicReactions).values(input).onDuplicateKeyUpdate({ set: { reaction: input.reaction, updatedAt: new Date() } });
  return getCommunitySignals(input.civicItemId, input.userId);
}

export async function setCivicVerification(input: { civicItemId: number; userId: number; response: "confirm" | "dispute" | "unable_to_verify" }) {
  const db = await getDb(); ensureDb(db);
  await db.insert(civicVerifications).values(input).onDuplicateKeyUpdate({ set: { response: input.response, updatedAt: new Date() } });
  if (input.response === "confirm") {
    await db.insert(citizenBadges).values({ userId: input.userId, badge: "neighborhood_ally", rationale: "Helped verify a nearby civic issue." }).onDuplicateKeyUpdate({ set: { rationale: "Helped verify a nearby civic issue." } });
    const confirmations = await db.select().from(civicVerifications).where(and(eq(civicVerifications.userId, input.userId), eq(civicVerifications.response, "confirm")));
    if (confirmations.length >= 3) await db.insert(citizenBadges).values({ userId: input.userId, badge: "trusted_verifier", rationale: "Provided three distinct confirmation signals for civic records." }).onDuplicateKeyUpdate({ set: { rationale: "Provided three distinct confirmation signals for civic records." } });
    if (confirmations.length >= 10) await db.insert(citizenBadges).values({ userId: input.userId, badge: "civic_steward", rationale: "Provided ten distinct confirmation signals for civic records." }).onDuplicateKeyUpdate({ set: { rationale: "Provided ten distinct confirmation signals for civic records." } });
  }
  return getCommunitySignals(input.civicItemId, input.userId);
}

export async function listCitizenBadges(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(citizenBadges).where(eq(citizenBadges.userId, userId)).orderBy(desc(citizenBadges.earnedAt));
}

export async function dispatchLocalVerificationAlert(input: { civicItemId: number; locality: string; reporterId: number }) {
  const db = await getDb(); ensureDb(db);
  const existing = await db.select().from(localVerificationAlerts).where(and(eq(localVerificationAlerts.civicItemId, input.civicItemId), eq(localVerificationAlerts.locality, input.locality))).limit(1);
  if (existing.length) return 0;
  await db.insert(localVerificationAlerts).values({ civicItemId: input.civicItemId, locality: input.locality });
  const residents = await db.select().from(citizenProfiles).where(and(eq(citizenProfiles.locality, input.locality), eq(citizenProfiles.inAppNotifications, true)));
  const recipientIds = residents.filter(resident => resident.userId !== input.reporterId).map(resident => resident.userId);
  if (recipientIds.length) await db.insert(civicNotifications).values(recipientIds.map(recipientId => ({ recipientId, civicItemId: input.civicItemId, type: "verification" as const, title: "Can you verify an issue nearby?", message: `A public civic report was filed in ${input.locality}. Confirm, dispute, or mark it as unable to verify.` })));
  return recipientIds.length;
}

export async function listCitizenCivicItems(citizenId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicItems)
    .where(eq(civicItems.citizenId, citizenId))
    .orderBy(desc(civicItems.createdAt));
}

export async function listOperationsCivicItems(limit = 60) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicItems).orderBy(desc(civicItems.updatedAt)).limit(limit);
}

export async function getPublicUpdates(civicItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicItemUpdates)
    .where(and(eq(civicItemUpdates.civicItemId, civicItemId), eq(civicItemUpdates.isPublic, true)))
    .orderBy(desc(civicItemUpdates.createdAt));
}

export async function getAllUpdates(civicItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicItemUpdates)
    .where(eq(civicItemUpdates.civicItemId, civicItemId))
    .orderBy(desc(civicItemUpdates.createdAt));
}

export async function saveCivicAttachment(input: {
  civicItemId: number;
  uploadedById: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  kind: "image" | "audio" | "video" | "document";
  sizeBytes: number;
}) {
  const db = await getDb();
  ensureDb(db);
  const [result] = await db.insert(civicAttachments).values({
    ...input,
    analysisStatus: "not_requested",
  });
  return { id: Number(result.insertId), ...input, analysisStatus: "not_requested" as const };
}

export async function listCivicAttachments(civicItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicAttachments)
    .where(eq(civicAttachments.civicItemId, civicItemId))
    .orderBy(desc(civicAttachments.createdAt));
}

export async function changeCivicItemStatus(input: {
  publicId: string;
  status: CivicStatus;
  actorId: number;
  message: string;
  isPublic: boolean;
}) {
  const db = await getDb();
  ensureDb(db);
  const item = await getCivicItemByPublicId(input.publicId);
  if (!item) throw new Error("Civic item not found");

  await db.transaction(async tx => {
    await tx.update(civicItems).set({
      status: input.status,
      resolvedAt: input.status === "resolved" ? new Date() : item.resolvedAt,
    }).where(eq(civicItems.id, item.id));
    await tx.insert(civicItemUpdates).values({
      civicItemId: item.id,
      actorId: input.actorId,
      eventType: input.status === "resolved" ? "resolved" : "status_changed",
      previousStatus: item.status,
      nextStatus: input.status,
      message: input.message,
      isPublic: input.isPublic,
    });
  });
  return item;
}

export async function assignCivicItem(input: {
  publicId: string;
  coordinatorId: number;
  actorId: number;
  message: string;
}) {
  const db = await getDb();
  ensureDb(db);
  const item = await getCivicItemByPublicId(input.publicId);
  if (!item) throw new Error("Civic item not found");
  await db.transaction(async tx => {
    await tx.update(civicItems).set({
      assignedCoordinatorId: input.coordinatorId,
      status: "assigned",
    }).where(eq(civicItems.id, item.id));
    await tx.insert(civicItemUpdates).values({
      civicItemId: item.id,
      actorId: input.actorId,
      eventType: "assignment_changed",
      previousStatus: item.status,
      nextStatus: "assigned",
      message: input.message,
      isPublic: true,
    });
  });
  return item;
}

export async function addCivicItemUpdate(input: {
  publicId: string;
  actorId: number;
  message: string;
  isPublic: boolean;
}) {
  const db = await getDb();
  ensureDb(db);
  const item = await getCivicItemByPublicId(input.publicId);
  if (!item) throw new Error("Civic item not found");
  await db.insert(civicItemUpdates).values({
    civicItemId: item.id,
    actorId: input.actorId,
    eventType: "public_update",
    message: input.message,
    isPublic: input.isPublic,
  });
  return item;
}

export async function createCivicNotification(input: {
  recipientId: number;
  civicItemId?: number | null;
  type: "receipt" | "assignment" | "status" | "resolution" | "update";
  title: string;
  message: string;
}) {
  const db = await getDb();
  ensureDb(db);
  await db.insert(civicNotifications).values(input);
}

export async function listCivicNotifications(recipientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(civicNotifications)
    .where(eq(civicNotifications.recipientId, recipientId))
    .orderBy(desc(civicNotifications.createdAt))
    .limit(30);
}

export async function markCivicNotificationRead(notificationId: number, recipientId: number) {
  const db = await getDb();
  ensureDb(db);
  await db.update(civicNotifications).set({ readAt: new Date() })
    .where(and(eq(civicNotifications.id, notificationId), eq(civicNotifications.recipientId, recipientId)));
}

export async function getCivicStats() {
  const db = await getDb();
  if (!db) return { total: 0, byStatus: {}, byCategory: {} };
  const items = await db.select({ status: civicItems.status, category: civicItems.category }).from(civicItems)
    .where(eq(civicItems.visibility, "public"));
  return items.reduce(
    (acc, item) => {
      acc.total += 1;
      acc.byStatus[item.status] = (acc.byStatus[item.status] ?? 0) + 1;
      acc.byCategory[item.category] = (acc.byCategory[item.category] ?? 0) + 1;
      return acc;
    },
    { total: 0, byStatus: {} as Record<string, number>, byCategory: {} as Record<string, number> }
  );
}

export async function getMapCivicItems() {
  const items = await listPublicCivicItems(100);
  return items.filter(item => item.latitude !== null && item.longitude !== null);
}

export async function saveTriageInsight(input: {
  civicItemId: number;
  model: string;
  suggestedTitle: string;
  suggestedCategory: CivicCategory;
  suggestedPriority: CivicPriority;
  summary: string;
  rationale: string;
  confidence: number;
}) {
  const db = await getDb();
  ensureDb(db);
  await db.insert(triageInsights).values({ ...input, state: "pending_review" });
}

export async function listTriageInsights(civicItemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(triageInsights)
    .where(eq(triageInsights.civicItemId, civicItemId))
    .orderBy(desc(triageInsights.createdAt));
}

export type DrfiInput = {
  civicItemId: number; demand: number; populationImpact: number; infrastructureGap: number;
  serviceAccess: number; budgetFeasibility: number; geospatialReality: number; trendGrowth: number;
  riskUrgency: number; evidenceNotes: string; reviewedById: number;
};

export async function saveDrfiAssessment(input: DrfiInput) {
  const db = await getDb();
  ensureDb(db);
  const { score, priority } = calculateDrfi(input);
  const values = { ...input, score, priority, weightVersion: "v1", reviewedAt: new Date() };
  await db.insert(drfiAssessments).values(values).onDuplicateKeyUpdate({ set: values });
  await db.update(civicItems).set({ priority }).where(eq(civicItems.id, input.civicItemId));
  return values;
}

export async function getDrfiAssessment(civicItemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(drfiAssessments).where(eq(drfiAssessments.civicItemId, civicItemId)).limit(1))[0];
}
