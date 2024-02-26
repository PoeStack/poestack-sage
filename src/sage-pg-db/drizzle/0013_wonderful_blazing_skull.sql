CREATE TABLE IF NOT EXISTS "listings" (
	"key" text PRIMARY KEY NOT NULL,
	"id" varchar(60),
	"user_id" varchar(60),
	"league" varchar(30),
	"category" varchar(30),
	"sub_category" varchar(30),
	"ign" varchar(55),
	"timestamp" integer,
	"listing_mode" varchar(25),
	"tabs" text,
	"items" text,
	"deleted" boolean
);
