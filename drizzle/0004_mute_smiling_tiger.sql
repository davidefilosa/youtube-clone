ALTER TABLE "videos" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "name";