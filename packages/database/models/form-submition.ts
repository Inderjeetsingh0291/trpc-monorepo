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

export interface FormSubmissionValue {
    formFieldId: string;
    value: string;
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionsTable = pgTable("form_submissions", {
   id: uuid("id").primaryKey().defaultRandom(),
   
   formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull(),
   
   // jsonb is generally preferred over json in Postgres for performance and querying capabilities
   values: jsonb("values").$type<FormSubmissionValueRow>().notNull().default([]),
   
   // This can be null if submissions are allowed from anonymous users
   createdBy: uuid("created_by").references(() => usersTable.id),
   updatedBy: uuid("updated_by").references(() => usersTable.id),
   
   createdAt: timestamp("created_at").defaultNow(),
   updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
