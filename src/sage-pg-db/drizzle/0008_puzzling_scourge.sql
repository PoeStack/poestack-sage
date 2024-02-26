DO $$ BEGIN
 CREATE TYPE "violation_target_type" AS ENUM('Discord', 'PoeAccount');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "violations" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"target_type" "violation_target_type",
	"target_id" varchar(60),
	"violation_desc" varchar(400),
	"violation_type" varchar(60),
	"violation_value" integer
);
