CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(60) PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"type" varchar(60) NOT NULL,
	"target_id" varchar(60) NOT NULL,
	"sender_id" varchar(60),
	"body" text NOT NULL
);
