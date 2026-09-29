import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const quizSettingsTable = pgTable("quiz_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  timeLimitMinutes: integer("time_limit_minutes"),
  maxAttempts: integer("max_attempts").default(1).notNull(),
  passingScore: integer("passing_score").default(50).notNull(),
  showResultImmediately: boolean("show_result_immediately").default(true).notNull(),
  showCorrectAnswers: boolean("show_correct_answers").default(true).notNull(),
  resultsPublished: boolean("results_published").default(true).notNull(),
  resultsPublishedAt: timestamp("results_published_at"),
  shuffleQuestions: boolean("shuffle_questions").default(false).notNull(),
  shuffleOptions: boolean("shuffle_options").default(false).notNull(),
  enableLeaderboard: boolean("enable_leaderboard").default(true).notNull(),
  accessCode: varchar("access_code", { length: 50 }),
  allowGuests: boolean("allow_guests").default(true).notNull(),
  questionsToShow: integer("questions_to_show"),
  difficultyDistribution: jsonb("difficulty_distribution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectQuizSettings = typeof quizSettingsTable.$inferSelect;
export type InsertQuizSettings = typeof quizSettingsTable.$inferInsert;
