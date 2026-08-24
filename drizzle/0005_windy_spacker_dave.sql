ALTER TABLE `civic_items` ADD `locality` varchar(160);--> statement-breakpoint
CREATE INDEX `civic_items_locality_idx` ON `civic_items` (`locality`);