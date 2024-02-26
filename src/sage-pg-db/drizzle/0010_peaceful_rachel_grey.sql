DROP TABLE "test_table";--> statement-breakpoint
ALTER TABLE "discord_accounts" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "discord_accounts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "poe_profiles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "poe_profiles" ADD COLUMN "updated_at" timestamp DEFAULT now();