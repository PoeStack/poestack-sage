ALTER TABLE "listings" ALTER COLUMN "key" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "league" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "sub_category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "ign" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "listing_mode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "tabs" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "items" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "deleted" SET NOT NULL;