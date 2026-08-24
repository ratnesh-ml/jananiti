CREATE TABLE `consent_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('platform','public_activity','future_identity') NOT NULL,
	`version` varchar(32) NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`withdrawnAt` timestamp,
	CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drfi_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`demand` int NOT NULL,
	`populationImpact` int NOT NULL,
	`infrastructureGap` int NOT NULL,
	`serviceAccess` int NOT NULL,
	`budgetFeasibility` int NOT NULL,
	`geospatialReality` int NOT NULL,
	`trendGrowth` int NOT NULL,
	`riskUrgency` int NOT NULL,
	`score` int NOT NULL,
	`priority` enum('low','standard','high','urgent') NOT NULL,
	`evidenceNotes` text NOT NULL,
	`weightVersion` varchar(32) NOT NULL DEFAULT 'v1',
	`reviewedById` int NOT NULL,
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drfi_assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `drfi_assessments_civicItemId_unique` UNIQUE(`civicItemId`)
);
--> statement-breakpoint
ALTER TABLE `consent_records` ADD CONSTRAINT `consent_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drfi_assessments` ADD CONSTRAINT `drfi_assessments_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drfi_assessments` ADD CONSTRAINT `drfi_assessments_reviewedById_users_id_fk` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `consent_records_user_idx` ON `consent_records` (`userId`);--> statement-breakpoint
CREATE INDEX `drfi_assessments_score_idx` ON `drfi_assessments` (`score`);