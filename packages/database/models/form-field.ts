import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    text,
    jsonb,
    numeric,
    integer,
    unique,
    pgEnum
} from "drizzle-orm/pg-core";

import { formsTable } from "./form";
import { usersTable } from "./user";

export const fieldTypeEnum = pgEnum("field_type_enum", [
    "text",
    "number",
    "email",
    "phone",
    "textarea",
    "select",
    "multi_select",
    "radio",
    "checkbox",
    "YES_NO",
    "file",
    "image",
    "rating",
    "date"
]);


export const formFieldsTable = pgTable("form_fields", {
    id: uuid("id").primaryKey().defaultRandom(),

    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),

    placeholder: varchar("placeholder", { length: 100 }),
    description: varchar("description", { length: 255 }),

    isRequired: boolean("is_required").default(false).notNull(),
    index: numeric("index", { scale: 2 }).notNull(),

    type: fieldTypeEnum("type").notNull(),


    formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }),

    createdBy: uuid("created_by").references(() => usersTable.id),
    updatedBy: uuid("updated_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => {
    return {
        uniqueFormIDAndIndex: unique().on(table.formId, table.index)
    }
})






