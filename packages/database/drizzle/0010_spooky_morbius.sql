ALTER TYPE "public"."field_type_enum" ADD VALUE 'multi_select' BEFORE 'radio';--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "password" varchar(255);