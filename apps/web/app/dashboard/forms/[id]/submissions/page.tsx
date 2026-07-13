"use client"

import { use } from "react"
import { useListSubmissions } from "~/hooks/api/form-submission"
import { useGetFields } from "~/hooks/api/form-field"
import { Spinner } from "~/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: formId } = use(params)
  const { submissions, isLoading, isError, error } = useListSubmissions(formId)
  const { fields, isLoading: fieldsLoading } = useGetFields(formId)

  if (isLoading || fieldsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 py-4 md:py-6 px-4 lg:px-6">
        <div className="rounded-lg border border-destructive p-8 text-center text-destructive">
          {error?.message ?? "Failed to load submissions."}
        </div>
      </div>
    )
  }

  // Build a map from fieldId -> field label for column headers
  const fieldMap = new Map(fields.map(f => [f.id, f.label]))

  // Get ordered field IDs for consistent columns
  const fieldIds = fields.map(f => f.id)

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          {submissions.length} response{submissions.length !== 1 ? "s" : ""} received.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">No submissions yet</p>
          <p className="text-sm text-muted-foreground">
            Share your form to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {fieldIds.map(fId => (
                  <TableHead key={fId}>{fieldMap.get(fId) ?? fId}</TableHead>
                ))}
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub, idx) => {
                // Build a map from fieldId -> value for this submission
                const valueMap = new Map(
                  (sub.values ?? []).map(v => [v.formFieldId, v.value])
                )

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="text-muted-foreground font-medium">
                      {idx + 1}
                    </TableCell>
                    {fieldIds.map(fId => (
                      <TableCell key={fId}>
                        {valueMap.get(fId) || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="text-muted-foreground">
                      {sub.createdAt
                        ? new Date(sub.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
