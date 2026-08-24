CREATE TABLE `civic_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civicItemId` int NOT NULL,
	`authorId` int NOT NULL,
	`parentCommentId` int,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civic_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `civic_comments` ADD CONSTRAINT `civic_comments_civicItemId_civic_items_id_fk` FOREIGN KEY (`civicItemId`) REFERENCES `civic_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_comments` ADD CONSTRAINT `civic_comments_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `civic_comments_item_created_idx` ON `civic_comments` (`civicItemId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `civic_comments_parent_idx` ON `civic_comments` (`parentCommentId`);