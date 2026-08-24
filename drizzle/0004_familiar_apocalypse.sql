CREATE TABLE `citizen_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badge` enum('first_report','neighborhood_ally','trusted_verifier','civic_steward') NOT NULL,
	`rationale` varchar(240) NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `citizen_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `citizen_badges_user_badge_idx` UNIQUE(`userId`,`badge`)
);
--> statement-breakpoint
CREATE TABLE `civic_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`userId` int NOT NULL,
	`reaction` enum('up','down') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civic_reactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `civic_reactions_item_user_idx` UNIQUE(`civicItemId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `civic_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`userId` int NOT NULL,
	`response` enum('confirm','dispute','unable_to_verify') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civic_verifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `civic_verifications_item_user_idx` UNIQUE(`civicItemId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `local_verification_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`locality` varchar(160) NOT NULL,
	`dispatchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `local_verification_alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_verification_alert_item_locality_idx` UNIQUE(`civicItemId`,`locality`)
);
--> statement-breakpoint
ALTER TABLE `civic_notifications` MODIFY COLUMN `type` enum('receipt','assignment','status','resolution','update','verification') NOT NULL;--> statement-breakpoint
ALTER TABLE `citizen_badges` ADD CONSTRAINT `citizen_badges_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_reactions` ADD CONSTRAINT `civic_reactions_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_reactions` ADD CONSTRAINT `civic_reactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_verifications` ADD CONSTRAINT `civic_verifications_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_verifications` ADD CONSTRAINT `civic_verifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `local_verification_alerts` ADD CONSTRAINT `local_verification_alerts_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `citizen_badges_user_idx` ON `citizen_badges` (`userId`);--> statement-breakpoint
CREATE INDEX `civic_reactions_item_idx` ON `civic_reactions` (`civicItemId`);--> statement-breakpoint
CREATE INDEX `civic_verifications_item_idx` ON `civic_verifications` (`civicItemId`);