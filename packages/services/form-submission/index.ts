import { db, eq, count, and } from "@repo/database"
import { formSubmissionsTable } from "@repo/database/models/form-submition"
import { formsTable } from "@repo/database/models/form"
import { formFieldsTable } from "@repo/database/models/form-field"
import { usersTable } from "@repo/database/models/user"
import { emailEnv } from "../env"
import {
    type SubmitFormInputType, submitFormInput,
    type ListSubmissionsByFormIdInputType, listSubmissionsByFormIdInput
} from "./model"

// Only initialize Resend if the API key is available
const getResend = () => {
    if (!emailEnv.RESEND_API_KEY) return null
    const { Resend } = require("resend")
    return new Resend(emailEnv.RESEND_API_KEY)
}


class FormSubmissionService {

    public async submitForm(payload: SubmitFormInputType) {
        const { formId, values } = await submitFormInput.parseAsync(payload)

        // 1. Fetch form to validate active status, expiry, and response limits
        const [form] = await db.select({
            isActive: formsTable.isActive,
            expiresAt: formsTable.expiresAt,
            maxResponses: formsTable.maxResponses,
        })
        .from(formsTable)
        .where(eq(formsTable.id, formId))

        if (!form) {
            throw Error("Form not found")
        }

        if (!form.isActive) {
            throw Error("This form is no longer accepting responses.")
        }

        if (form.expiresAt && new Date() > new Date(form.expiresAt)) {
            throw Error("This form has expired and is no longer accepting responses.")
        }

        if (form.maxResponses !== null) {
            const [submissionCount] = await db.select({ count: count() })
                .from(formSubmissionsTable)
                .where(eq(formSubmissionsTable.formId, formId))

            if (submissionCount && submissionCount.count >= form.maxResponses) {
                throw Error("This form has reached its maximum number of responses.")
            }
        }

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

        // Real Email Notification via Resend (skipped if RESEND_API_KEY not set)
        try {
            const resendClient = getResend()
            if (resendClient) {
                const formDetails = await db.select({
                    title: formsTable.title,
                    creatorEmail: usersTable.email,
                })
                .from(formsTable)
                .innerJoin(usersTable, eq(formsTable.createdBy, usersTable.id))
                .where(eq(formsTable.id, formId))
                .limit(1)

                const formDetail = formDetails[0]
                if (formDetail) {
                    const { title, creatorEmail } = formDetail
                    const fromEmail = emailEnv.FROM_EMAIL ?? "onboarding@resend.dev"

                    // 1. Send notification to form CREATOR (existing behavior)
                    const { data, error } = await resendClient.emails.send({
                        from: `Sawaalnama <${fromEmail}>`,
                        to: creatorEmail,
                        subject: `New Submission for "${title}"`,
                        html: `
                            <div style="font-family:sans-serif;max-width:500px;margin:auto">
                              <h2 style="color:#b45309">New Response on Sawaalnama</h2>
                              <p>Hi there,</p>
                              <p>You have received a new submission for your form <strong>${title}</strong>.</p>
                              <p>Log in to your dashboard to view analytics and the full response.</p>
                              <hr/>
                              <p style="color:#888;font-size:12px">Sawaalnama — Punjab Edition</p>
                            </div>
                        `,
                    })

                    if (error) {
                        console.error("Resend failed to send creator email:", error)
                    } else {
                        console.log(`Creator email sent via Resend, id: ${data?.id}`)
                    }

                    // 2. Send confirmation to the RESPONDENT (person who filled the form)
                    // Find email-type fields in this form to extract respondent email
                    const emailFields = await db.select({ id: formFieldsTable.id })
                        .from(formFieldsTable)
                        .where(and(
                            eq(formFieldsTable.formId, formId),
                            eq(formFieldsTable.type, "email")
                        ))

                    let respondentEmail: string | null = null
                    if (emailFields.length > 0) {
                        const emailFieldIds = new Set(emailFields.map(f => f.id))
                        for (const v of values) {
                            if (emailFieldIds.has(v.formFieldId) && v.value && v.value.includes("@")) {
                                respondentEmail = v.value.trim()
                                break
                            }
                        }
                    }

                    if (respondentEmail && respondentEmail !== creatorEmail) {
                        try {
                            const { data: rData, error: rError } = await resendClient.emails.send({
                                from: `Sawaalnama <${fromEmail}>`,
                                to: respondentEmail,
                                subject: `Your response to "${title}" was recorded`,
                                html: `
                                    <div style="font-family:sans-serif;max-width:500px;margin:auto">
                                      <h2 style="color:#b45309">Thank You!</h2>
                                      <p>Hi there,</p>
                                      <p>Your response to <strong>${title}</strong> has been successfully recorded.</p>
                                      <p>Thank you for taking the time to fill out this form.</p>
                                      <hr/>
                                      <p style="color:#888;font-size:12px">Sawaalnama — Punjab Edition</p>
                                    </div>
                                `,
                            })
                            if (rError) {
                                console.error("Resend failed to send respondent email:", rError)
                            } else {
                                console.log(`Respondent email sent via Resend to ${respondentEmail}, id: ${rData?.id}`)
                            }
                        } catch (respondentErr) {
                            console.error("Failed to send respondent confirmation:", respondentErr)
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to send email notification:", error)
        }


        return {
            submissionId: insertResult[0].id,
            createdAt: insertResult[0].createdAt,
        }
    }

    public async listSubmissionsByFormId(payload: ListSubmissionsByFormIdInputType & { userId: string }) {
        const { formId } = await listSubmissionsByFormIdInput.parseAsync(payload)
        const { userId } = payload

        // Verify ownership: only the form creator can view submissions
        const [form] = await db.select({ createdBy: formsTable.createdBy })
            .from(formsTable)
            .where(eq(formsTable.id, formId))

        if (!form) throw new Error("Form not found")
        if (form.createdBy !== userId) throw new Error("You are not authorized to view submissions for this form.")

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