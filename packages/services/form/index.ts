import { db, eq, asc } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { type CreateFormInputType, createFormInput } from "./model"
import { type ListFormsByUserIdInputType, listFormsByUserIdInput, type GetFormByIdInputType, getFormByIdInput } from "./model"
import { formFieldsTable } from "@repo/database/models/form-field"

class FormService {

    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload)

        const formInsertResult = await db.insert(formsTable).values({
            title,
            description,
            createdBy: createdBy,
            updatedBy: createdBy,
        }).returning({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            createdAt: formsTable.createdAt,
        })

        if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id) throw Error(`Something went wrong while creating the form with title ${title} and description ${description}, try again`)

        return {
            formId: formInsertResult[0].id,
            }
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isActive: formsTable.isActive,
            createdAt: formsTable.createdAt,
        })
        .from(formsTable)
        .where(eq(formsTable.createdBy, userId))

        return { forms }
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId } = await getFormByIdInput.parseAsync(payload)

        const rows = await db.select({
            form: {
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                isActive: formsTable.isActive,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
            },
            field: formFieldsTable
        })
        .from(formsTable)
        .leftJoin(formFieldsTable, eq(formsTable.id, formFieldsTable.formId))
        .where(eq(formsTable.id, formId))
        .orderBy(asc(formFieldsTable.index))

        if (rows.length === 0) {
            throw Error(`Form not found with id ${formId}`)
        }

        const { id, title, description, isActive, createdAt, updatedAt } = rows[0].form
        const fields = rows
            .filter(r => r.field !== null)
            .map(r => r.field as NonNullable<typeof r.field>)

        return { 
            form: { 
                id, 
                title, 
                description, 
                isActive, 
                createdAt, 
                updatedAt, 
                fields 
            } 
        }
    }
}

export default FormService

