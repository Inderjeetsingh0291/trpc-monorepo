import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { quizQuestionTypeEnum, quizDifficultyEnum } from "./quiz-question";

export interface QuestionBankOptionItem {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export const questionBankTable = pgTable(
  "question_bank",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    question: text("question").notNull(),
    questionType: quizQuestionTypeEnum("question_type").default("MCQ").notNull(),
    marks: integer("marks").default(1).notNull(),
    negativeMarks: integer("negative_marks").default(0).notNull(),
    explanation: text("explanation"),
    difficulty: quizDifficultyEnum("difficulty").default("MEDIUM").notNull(),
    category: varchar("category", { length: 100 }),
    tags: text("tags").array(),
    acceptedAnswers: text("accepted_answers").array(),
    options: jsonb("options").$type<QuestionBankOptionItem[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdIdx: index("question_bank_owner_id_idx").on(table.ownerId),
    categoryIdx: index("question_bank_category_idx").on(table.category),
  })
);

export type SelectQuestionBank = typeof questionBankTable.$inferSelect;
export type InsertQuestionBank = typeof questionBankTable.$inferInsert;
