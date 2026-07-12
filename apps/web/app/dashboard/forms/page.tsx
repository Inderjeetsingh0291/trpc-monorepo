"use client"

import { CreateFormDialog } from "./_components/create-form-dialog"
import { FormsTable } from "./_components/forms-table"

export default function FormsPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p className="text-muted-foreground">Manage your forms here.</p>
        </div>
        <CreateFormDialog />
      </div>

      <FormsTable />
    </div>
  )
}
