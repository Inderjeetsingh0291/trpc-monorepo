ALTER TABLE "quiz_settings" ADD COLUMN "results_published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_settings" ADD COLUMN "results_published_at" timestamp;