import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const quizQuestionTypeEnum = pgEnum("quiz_question_type", [
  "MCQ",
  "MULTIPLE_SELECT",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "FILL_BLANK",
]);

export const quizDifficultyEnum = pgEnum("quiz_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);

export const quizQuestionsTable = pgTable(
  "quiz_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => formsTable.id, { onDelete: "cascade" })
      .notNull(),
    question: text("question").notNull(),
    questionType: quizQuestionTypeEnum("question_type").default("MCQ").notNull(),
    marks: integer("marks").default(1).notNull(),
    negativeMarks: integer("negative_marks").default(0).notNull(),
    explanation: text("explanation"),
    order: integer("order").default(0).notNull(),
    difficulty: quizDifficultyEnum("difficulty").default("MEDIUM").notNull(),
    category: varchar("category", { length: 100 }),
    tags: text("tags").array(),
    acceptedAnswers: text("accepted_answers").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    formIdIdx: index("quiz_questions_form_id_idx").on(table.formId),
    orderIdx: index("quiz_questions_order_idx").on(table.order),
  })
);

export type SelectQuizQuestion = typeof quizQuestionsTable.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestionsTable.$inferInsert;
