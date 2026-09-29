import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);
export const formTypeEnum = pgEnum("form_type", ["form", "quiz"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: formTypeEnum("type").default("form").notNull(),
  isActive: boolean("is_active").default(false),
  visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  password: varchar("password", { length: 255 }),
  isArchived: boolean("is_archived").default(false).notNull(),
  layout: varchar("layout", { length: 20 }).default("step").notNull(),

  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "cascade" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => ({
  createdByIdx: index("forms_created_by_idx").on(table.createdBy),
  typeIdx: index("forms_type_idx").on(table.type),
  isActiveIdx: index("forms_is_active_idx").on(table.isActive),
}));
