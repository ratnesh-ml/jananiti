CREATE TABLE `civic_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`uploadedById` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`kind` enum('image','audio','document') NOT NULL,
	`sizeBytes` int NOT NULL,
	`analysisStatus` enum('not_requested','pending','completed','failed') NOT NULL DEFAULT 'not_requested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `civic_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `civic_attachments` ADD CONSTRAINT `civic_attachments_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_attachments` ADD CONSTRAINT `civic_attachments_uploadedById_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `civic_attachments_item_idx` ON `civic_attachments` (`civicItemId`);--> statement-breakpoint
CREATE INDEX `civic_attachments_uploader_idx` ON `civic_attachments` (`uploadedById`);