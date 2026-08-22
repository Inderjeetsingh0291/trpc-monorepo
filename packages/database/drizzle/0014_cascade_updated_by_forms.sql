ALTER TABLE "forms" DROP CONSTRAINT IF EXISTS "forms_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL;
