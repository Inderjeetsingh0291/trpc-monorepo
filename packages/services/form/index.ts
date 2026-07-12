import { db, eq } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { type CreateFormInputType, createFormInput } from "./model"

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
}

export default FormService
