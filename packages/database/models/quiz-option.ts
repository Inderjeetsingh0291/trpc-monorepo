import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { quizQuestionsTable } from "./quiz-question";

export const quizOptionsTable = pgTable(
  "quiz_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .references(() => quizQuestionsTable.id, { onDelete: "cascade" })
      .notNull(),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    questionIdIdx: index("quiz_options_question_id_idx").on(table.questionId),
  })
);

export type SelectQuizOption = typeof quizOptionsTable.$inferSelect;
export type InsertQuizOption = typeof quizOptionsTable.$inferInsert;
