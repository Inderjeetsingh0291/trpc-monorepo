import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { quizAttemptsTable } from "./quiz-attempt";
import { quizQuestionsTable } from "./quiz-question";

export const quizAnswersTable = pgTable(
  "quiz_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .references(() => quizAttemptsTable.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => quizQuestionsTable.id, { onDelete: "cascade" })
      .notNull(),
    selectedOptionIds: jsonb("selected_option_ids").$type<string[]>().default([]),
    textAnswer: text("text_answer"),
    isCorrect: boolean("is_correct"),
    marksAwarded: integer("marks_awarded").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    attemptIdIdx: index("quiz_answers_attempt_id_idx").on(table.attemptId),
    questionIdIdx: index("quiz_answers_question_id_idx").on(table.questionId),
    attemptQuestionIdx: index("quiz_answers_attempt_question_idx").on(table.attemptId, table.questionId),
  })
);

export type SelectQuizAnswer = typeof quizAnswersTable.$inferSelect;
export type InsertQuizAnswer = typeof quizAnswersTable.$inferInsert;
