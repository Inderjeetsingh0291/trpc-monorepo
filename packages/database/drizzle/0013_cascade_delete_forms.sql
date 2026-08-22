ALTER TABLE "forms" DROP CONSTRAINT IF EXISTS "forms_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE;
