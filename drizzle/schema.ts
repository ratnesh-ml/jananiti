import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const civicCategories = [
  "roads",
  "water",
  "sanitation",
  "electricity",
  "health",
  "education",
  "safety",
  "environment",
  "other",
] as const;

export const civicStatuses = [
  "submitted",
  "acknowledged",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const civicPriorities = ["low", "standard", "high", "urgent"] as const;
export const sourceChannels = [
  "web",
  "whatsapp",
  "sms",
  "telegram",
  "ivrs",
  "field_worker",
  "social",
] as const;
export const contentTypes = ["text", "voice", "image", "mixed"] as const;

export type CivicCategory = (typeof civicCategories)[number];
export type CivicStatus = (typeof civicStatuses)[number];
export type CivicPriority = (typeof civicPriorities)[number];

/** Core user table backing the OAuth flow. `admin` is the coordinator role in Jananiti. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const citizenProfiles = mysqlTable(
  "citizen_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    locality: varchar("locality", { length: 160 }),
    ward: varchar("ward", { length: 120 }),
    district: varchar("district", { length: 120 }),
    inAppNotifications: boolean("inAppNotifications").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("citizen_profiles_user_idx").on(table.userId)]
);

export const consentRecords = mysqlTable("consent_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["platform", "public_activity", "future_identity"]).notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  withdrawnAt: timestamp("withdrawnAt"),
}, table => [index("consent_records_user_idx").on(table.userId)]);

export const civicItems = mysqlTable(
  "civic_items",
  {
    id: int("id").autoincrement().primaryKey(),
    publicId: varchar("publicId", { length: 24 }).notNull(),
    citizenId: int("citizenId").notNull().references(() => users.id, { onDelete: "cascade" }),
    assignedCoordinatorId: int("assignedCoordinatorId").references(() => users.id, { onDelete: "set null" }),
    category: mysqlEnum("category", civicCategories).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull(),
    locationLabel: varchar("locationLabel", { length: 240 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    status: mysqlEnum("status", civicStatuses).notNull().default("submitted"),
    priority: mysqlEnum("priority", civicPriorities).notNull().default("standard"),
    visibility: mysqlEnum("visibility", ["public", "private"]).notNull().default("public"),
    sourceChannel: mysqlEnum("sourceChannel", sourceChannels).notNull().default("web"),
    contentType: mysqlEnum("contentType", contentTypes).notNull().default("text"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
  },
  table => [
    uniqueIndex("civic_items_public_id_idx").on(table.publicId),
    index("civic_items_citizen_idx").on(table.citizenId),
    index("civic_items_status_idx").on(table.status),
    index("civic_items_category_idx").on(table.category),
    index("civic_items_created_idx").on(table.createdAt),
  ]
);

export const civicItemUpdates = mysqlTable(
  "civic_item_updates",
  {
    id: int("id").autoincrement().primaryKey(),
    civicItemId: int("civicItemId").notNull().references(() => civicItems.id, { onDelete: "cascade" }),
    actorId: int("actorId").references(() => users.id, { onDelete: "set null" }),
    eventType: mysqlEnum("eventType", [
      "received",
      "status_changed",
      "assignment_changed",
      "public_update",
      "resolved",
    ]).notNull(),
    previousStatus: mysqlEnum("previousStatus", civicStatuses),
    nextStatus: mysqlEnum("nextStatus", civicStatuses),
    message: text("message").notNull(),
    isPublic: boolean("isPublic").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("civic_item_updates_item_idx").on(table.civicItemId),
    index("civic_item_updates_created_idx").on(table.createdAt),
  ]
);

export const civicAttachments = mysqlTable(
  "civic_attachments",
  {
    id: int("id").autoincrement().primaryKey(),
    civicItemId: int("civicItemId").notNull().references(() => civicItems.id, { onDelete: "cascade" }),
    uploadedById: int("uploadedById").notNull().references(() => users.id, { onDelete: "cascade" }),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    originalName: varchar("originalName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 120 }).notNull(),
    kind: mysqlEnum("kind", ["image", "audio", "document"]).notNull(),
    sizeBytes: int("sizeBytes").notNull(),
    analysisStatus: mysqlEnum("analysisStatus", ["not_requested", "pending", "completed", "failed"]).notNull().default("not_requested"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("civic_attachments_item_idx").on(table.civicItemId),
    index("civic_attachments_uploader_idx").on(table.uploadedById),
  ]
);

export const drfiAssessments = mysqlTable("drfi_assessments", {
  id: int("id").autoincrement().primaryKey(),
  civicItemId: int("civicItemId").notNull().unique().references(() => civicItems.id, { onDelete: "cascade" }),
  demand: int("demand").notNull(),
  populationImpact: int("populationImpact").notNull(),
  infrastructureGap: int("infrastructureGap").notNull(),
  serviceAccess: int("serviceAccess").notNull(),
  budgetFeasibility: int("budgetFeasibility").notNull(),
  geospatialReality: int("geospatialReality").notNull(),
  trendGrowth: int("trendGrowth").notNull(),
  riskUrgency: int("riskUrgency").notNull(),
  score: int("score").notNull(),
  priority: mysqlEnum("priority", civicPriorities).notNull(),
  evidenceNotes: text("evidenceNotes").notNull(),
  weightVersion: varchar("weightVersion", { length: 32 }).notNull().default("v1"),
  reviewedById: int("reviewedById").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewedAt: timestamp("reviewedAt").defaultNow().notNull(),
}, table => [index("drfi_assessments_score_idx").on(table.score)]);

export const civicNotifications = mysqlTable(
  "civic_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientId: int("recipientId").notNull().references(() => users.id, { onDelete: "cascade" }),
    civicItemId: int("civicItemId").references(() => civicItems.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", ["receipt", "assignment", "status", "resolution", "update"]).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    message: text("message").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("civic_notifications_recipient_idx").on(table.recipientId),
    index("civic_notifications_created_idx").on(table.createdAt),
  ]
);

export const triageInsights = mysqlTable(
  "triage_insights",
  {
    id: int("id").autoincrement().primaryKey(),
    civicItemId: int("civicItemId").notNull().references(() => civicItems.id, { onDelete: "cascade" }),
    model: varchar("model", { length: 120 }).notNull(),
    suggestedTitle: varchar("suggestedTitle", { length: 160 }).notNull(),
    suggestedCategory: mysqlEnum("suggestedCategory", civicCategories).notNull(),
    suggestedPriority: mysqlEnum("suggestedPriority", civicPriorities).notNull(),
    summary: text("summary").notNull(),
    rationale: text("rationale").notNull(),
    confidence: int("confidence").notNull(),
    state: mysqlEnum("state", ["pending_review", "accepted", "dismissed", "unavailable"]).notNull().default("pending_review"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("triage_insights_item_idx").on(table.civicItemId)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CivicItem = typeof civicItems.$inferSelect;
