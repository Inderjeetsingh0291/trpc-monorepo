import { db, eq } from "./index"
import { usersTable } from "./models/user"
import { formsTable } from "./models/form"
import { formFieldsTable } from "./models/form-field"


async function main() {
    console.log("Seeding database...")
    
    // Check if Demo User exists
    let [demoUser] = await db.select().from(usersTable).where(eq(usersTable.email, "demo@sawaalnama.com"))

    if (!demoUser) {
        const [insertedUser] = await db.insert(usersTable).values({
            email: "demo@sawaalnama.com",
            password: "password123", // In a real app this would be hashed
            fullName: "Demo User"
        }).returning()
        demoUser = insertedUser
    }
    
    console.log("Created demo user:", demoUser.id)

    // Create a demo form
    const [demoForm] = await db.insert(formsTable).values({
        title: "Demo Contact Form",
        description: "A sample form to demonstrate Sawaalnama features.",
        createdBy: demoUser.id,
        updatedBy: demoUser.id,
        isActive: true,
        visibility: "public"
    }).returning()

    console.log("Created demo form:", demoForm.id)

    // Add fields to form
    await db.insert(formFieldsTable).values([
        {
            formId: demoForm.id,
            label: "Full Name",
            labelKey: "full-name",
            placeholder: "Enter your name",
            description: "",
            type: "text",
            isRequired: true,
            index: "1.00",
            createdBy: demoUser.id,
            updatedBy: demoUser.id,
        },
        {
            formId: demoForm.id,
            label: "Email Address",
            labelKey: "email-address",
            placeholder: "hello@example.com",
            description: "We'll never share your email.",
            type: "email",
            isRequired: true,
            index: "2.00",
            createdBy: demoUser.id,
            updatedBy: demoUser.id,
        },
        {
            formId: demoForm.id,
            label: "Rating",
            labelKey: "rating",
            placeholder: "",
            description: "How would you rate our platform?",
            type: "rating",
            isRequired: false,
            index: "3.00",
            createdBy: demoUser.id,
            updatedBy: demoUser.id,
        }
    ])

    console.log("Added fields to demo form.")
    console.log("Seeding complete!")
    process.exit(0)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
