CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "visibility" "form_visibility" DEFAULT 'unlisted' NOT NULL;