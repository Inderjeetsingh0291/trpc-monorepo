CREATE TYPE "public"."field_type_enum" AS ENUM('text', 'number', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'YES_NO', 'file', 'image');--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(55) NOT NULL,
	"label_key" varchar(55) NOT NULL,
	"placeholder" varchar(55),
	"description" varchar(255),
	"is_required" boolean DEFAULT false NOT NULL,
	"index" numeric NOT NULL,
	"type" "field_type_enum" NOT NULL,
	"form_id" uuid,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "form_fields_form_id_index_unique" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;