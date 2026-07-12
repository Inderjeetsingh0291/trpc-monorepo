import { FormBuilder } from "./_components/form-builder"

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">Form Builder</h1>
        <p className="text-muted-foreground">
          Edit and configure your form.
        </p>
      </div>

      <FormBuilder formId={id} />
    </div>
  )
}
