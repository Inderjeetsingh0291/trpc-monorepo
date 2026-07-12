import { PublicForm } from "~/components/public-form"

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ form_id: string }>
}) {
  const { form_id } = await params

  return <PublicForm formId={form_id} />
}
