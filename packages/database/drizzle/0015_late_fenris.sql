CREATE TYPE "public"."form_type" AS ENUM('form', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."quiz_difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."quiz_question_type" AS ENUM('MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANK');--> statement-breakpoint
CREATE TYPE "public"."quiz_attempt_status" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "quiz_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"time_limit_minutes" integer,
	"max_attempts" integer DEFAULT 1 NOT NULL,
	"passing_score" integer DEFAULT 50 NOT NULL,
	"show_result_immediately" boolean DEFAULT true NOT NULL,
	"show_correct_answers" boolean DEFAULT true NOT NULL,
	"shuffle_questions" boolean DEFAULT false NOT NULL,
	"shuffle_options" boolean DEFAULT false NOT NULL,
	"enable_leaderboard" boolean DEFAULT true NOT NULL,
	"access_code" varchar(50),
	"allow_guests" boolean DEFAULT true NOT NULL,
	"questions_to_show" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "quiz_settings_form_id_unique" UNIQUE("form_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" "quiz_question_type" DEFAULT 'MCQ' NOT NULL,
	"marks" integer DEFAULT 1 NOT NULL,
	"negative_marks" integer DEFAULT 0 NOT NULL,
	"explanation" text,
	"order" integer DEFAULT 0 NOT NULL,
	"difficulty" "quiz_difficulty" DEFAULT 'MEDIUM' NOT NULL,
	"category" varchar(100),
	"tags" text[],
	"accepted_answers" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quiz_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"user_id" uuid,
	"participant_name" varchar(100) NOT NULL,
	"participant_email" varchar(255),
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"expires_at" timestamp,
	"score" integer DEFAULT 0 NOT NULL,
	"total_marks" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"status" "quiz_attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"time_taken" integer DEFAULT 0 NOT NULL,
	"selected_question_ids" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_ids" jsonb DEFAULT '[]'::jsonb,
	"text_answer" text,
	"is_correct" boolean,
	"marks_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "question_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" "quiz_question_type" DEFAULT 'MCQ' NOT NULL,
	"marks" integer DEFAULT 1 NOT NULL,
	"negative_marks" integer DEFAULT 0 NOT NULL,
	"explanation" text,
	"difficulty" "quiz_difficulty" DEFAULT 'MEDIUM' NOT NULL,
	"category" varchar(100),
	"tags" text[],
	"accepted_answers" text[],
	"options" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "forms" DROP CONSTRAINT "forms_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "forms" DROP CONSTRAINT "forms_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "type" "form_type" DEFAULT 'form' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_settings" ADD CONSTRAINT "quiz_settings_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_questions_form_id_idx" ON "quiz_questions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "quiz_questions_order_idx" ON "quiz_questions" USING btree ("order");--> statement-breakpoint
CREATE INDEX "quiz_options_question_id_idx" ON "quiz_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_form_id_idx" ON "quiz_attempts" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_id_idx" ON "quiz_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_status_idx" ON "quiz_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quiz_answers_attempt_id_idx" ON "quiz_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "quiz_answers_question_id_idx" ON "quiz_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_bank_owner_id_idx" ON "question_bank" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "question_bank_category_idx" ON "question_bank" USING btree ("category");--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forms_created_by_idx" ON "forms" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "forms_type_idx" ON "forms" USING btree ("type");--> statement-breakpoint
CREATE INDEX "forms_is_active_idx" ON "forms" USING btree ("is_active");