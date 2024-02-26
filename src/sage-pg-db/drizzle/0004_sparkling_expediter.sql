ALTER TABLE "vouches" RENAME COLUMN "vouch_id" TO "id";--> statement-breakpoint
ALTER TABLE "vouches" ALTER COLUMN "id" SET DATA TYPE varchar(256);