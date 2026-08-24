CREATE TABLE `citizen_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`locality` varchar(160),
	`ward` varchar(120),
	`district` varchar(120),
	`inAppNotifications` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `citizen_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `citizen_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `civic_item_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`actorId` int,
	`eventType` enum('received','status_changed','assignment_changed','public_update','resolved') NOT NULL,
	`previousStatus` enum('submitted','acknowledged','assigned','in_progress','resolved','closed'),
	`nextStatus` enum('submitted','acknowledged','assigned','in_progress','resolved','closed'),
	`message` text NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `civic_item_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `civic_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(24) NOT NULL,
	`citizenId` int NOT NULL,
	`assignedCoordinatorId` int,
	`category` enum('roads','water','sanitation','electricity','health','education','safety','environment','other') NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`locationLabel` varchar(240) NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`status` enum('submitted','acknowledged','assigned','in_progress','resolved','closed') NOT NULL DEFAULT 'submitted',
	`priority` enum('low','standard','high','urgent') NOT NULL DEFAULT 'standard',
	`visibility` enum('public','private') NOT NULL DEFAULT 'public',
	`sourceChannel` enum('web','whatsapp','sms','telegram','ivrs','field_worker','social') NOT NULL DEFAULT 'web',
	`contentType` enum('text','voice','image','mixed') NOT NULL DEFAULT 'text',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `civic_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `civic_items_public_id_idx` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `civic_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientId` int NOT NULL,
	`civicItemId` int,
	`type` enum('receipt','assignment','status','resolution','update') NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `civic_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `triage_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`model` varchar(120) NOT NULL,
	`suggestedTitle` varchar(160) NOT NULL,
	`suggestedCategory` enum('roads','water','sanitation','electricity','health','education','safety','environment','other') NOT NULL,
	`suggestedPriority` enum('low','standard','high','urgent') NOT NULL,
	`summary` text NOT NULL,
	`rationale` text NOT NULL,
	`confidence` int NOT NULL,
	`state` enum('pending_review','accepted','dismissed','unavailable') NOT NULL DEFAULT 'pending_review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `triage_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `citizen_profiles` ADD CONSTRAINT `citizen_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_item_updates` ADD CONSTRAINT `civic_item_updates_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_item_updates` ADD CONSTRAINT `civic_item_updates_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_items` ADD CONSTRAINT `civic_items_citizenId_users_id_fk` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_items` ADD CONSTRAINT `civic_items_assignedCoordinatorId_users_id_fk` FOREIGN KEY (`assignedCoordinatorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_notifications` ADD CONSTRAINT `civic_notifications_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_notifications` ADD CONSTRAINT `civic_notifications_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `triage_insights` ADD CONSTRAINT `triage_insights_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `citizen_profiles_user_idx` ON `citizen_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `civic_item_updates_item_idx` ON `civic_item_updates` (`civicItemId`);--> statement-breakpoint
CREATE INDEX `civic_item_updates_created_idx` ON `civic_item_updates` (`createdAt`);--> statement-breakpoint
CREATE INDEX `civic_items_citizen_idx` ON `civic_items` (`citizenId`);--> statement-breakpoint
CREATE INDEX `civic_items_status_idx` ON `civic_items` (`status`);--> statement-breakpoint
CREATE INDEX `civic_items_category_idx` ON `civic_items` (`category`);--> statement-breakpoint
CREATE INDEX `civic_items_created_idx` ON `civic_items` (`createdAt`);--> statement-breakpoint
CREATE INDEX `civic_notifications_recipient_idx` ON `civic_notifications` (`recipientId`);--> statement-breakpoint
CREATE INDEX `civic_notifications_created_idx` ON `civic_notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `triage_insights_item_idx` ON `triage_insights` (`civicItemId`);