import { db, eq } from "@repo/database"
import { formSubmissionsTable } from "@repo/database/models/form-submition"
import {
    type SubmitFormInputType, submitFormInput,
    type ListSubmissionsByFormIdInputType, listSubmissionsByFormIdInput
} from "./model"

class FormSubmissionService {

    public async submitForm(payload: SubmitFormInputType) {
        const { formId, values } = await submitFormInput.parseAsync(payload)

        const insertResult = await db.insert(formSubmissionsTable).values({
            formId,
            values,
        }).returning({
            id: formSubmissionsTable.id,
            createdAt: formSubmissionsTable.createdAt,
        })

        if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
            throw Error(`Something went wrong while submitting the form ${formId}, try again`)
        }

        return {
            submissionId: insertResult[0].id,
            createdAt: insertResult[0].createdAt,
        }
    }

    public async listSubmissionsByFormId(payload: ListSubmissionsByFormIdInputType) {
        const { formId } = await listSubmissionsByFormIdInput.parseAsync(payload)

        const submissions = await db.select({
            id: formSubmissionsTable.id,
            formId: formSubmissionsTable.formId,
            values: formSubmissionsTable.values,
            createdAt: formSubmissionsTable.createdAt,
        })
        .from(formSubmissionsTable)
        .where(eq(formSubmissionsTable.formId, formId))

        return { submissions }
    }
}

export default FormSubmissionService
