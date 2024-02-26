DO $$ BEGIN
 CREATE TYPE "vouch_type" AS ENUM('Discord', 'PoeAccount');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_accounts" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"poe_account_id" varchar(100),
	"name" varchar(60)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poe_profiles" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"name" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vouches" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"source_type" "vouch_type",
	"source_id" varchar(60),
	"target_id" varchar(60),
	"vouch_type" varchar(60),
	"vouch_value" integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "name_idx" ON "poe_profiles" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_accounts" ADD CONSTRAINT "discord_accounts_poe_account_id_poe_profiles_id_fk" FOREIGN KEY ("poe_account_id") REFERENCES "poe_profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
