import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { usersTable } from "./user";

export const quizAttemptStatusEnum = pgEnum("quiz_attempt_status", [
  "IN_PROGRESS",
  "SUBMITTED",
  "EXPIRED",
]);

export const quizAttemptsTable = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => formsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    participantName: varchar("participant_name", { length: 100 }).notNull(),
    participantEmail: varchar("participant_email", { length: 255 }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    expiresAt: timestamp("expires_at"),
    score: integer("score").default(0).notNull(),
    totalMarks: integer("total_marks").default(0).notNull(),
    percentage: integer("percentage").default(0).notNull(),
    passed: boolean("passed").default(false).notNull(),
    status: quizAttemptStatusEnum("status").default("IN_PROGRESS").notNull(),
    timeTaken: integer("time_taken").default(0).notNull(),
    selectedQuestionIds: jsonb("selected_question_ids").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    formIdIdx: index("quiz_attempts_form_id_idx").on(table.formId),
    userIdIdx: index("quiz_attempts_user_id_idx").on(table.userId),
    statusIdx: index("quiz_attempts_status_idx").on(table.status),
    participantEmailIdx: index("quiz_attempts_participant_email_idx").on(table.participantEmail),
    formEmailIdx: index("quiz_attempts_form_email_idx").on(table.formId, table.participantEmail),
  })
);

export type SelectQuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type InsertQuizAttempt = typeof quizAttemptsTable.$inferInsert;
