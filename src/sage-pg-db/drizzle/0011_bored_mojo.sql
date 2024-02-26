CREATE TABLE IF NOT EXISTS "poe_accounts" (
	"id" varchar(75) PRIMARY KEY NOT NULL,
	"poe_profile_id" varchar(60),
	"name" varchar(256),
	"realm" varchar(60),
	"class" varchar(60),
	"league" varchar(60),
	"level" integer,
	"experience" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
