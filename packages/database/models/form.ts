import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 55 }).notNull(),
  description: varchar("description", { length: 55 }),
  isActive: boolean("is_active").default(false),
  visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),

  createdBy: uuid("created_by").references(() => usersTable.id),
  updatedBy: uuid("updated_by").references(() => usersTable.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});