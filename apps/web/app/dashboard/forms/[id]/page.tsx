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

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <p className="text-sm text-muted-foreground">
          Builder for form <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{id}</code>
        </p>
      </div>
    </div>
  )
}
