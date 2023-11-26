CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`itemGroupHashString` text,
	`shard` text,
	`listedAtTimestamp` integer,
	`value` text,
	`valueType` text,
	`quantity` integer
);
