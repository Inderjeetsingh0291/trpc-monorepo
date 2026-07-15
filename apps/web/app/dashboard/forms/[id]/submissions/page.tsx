"use client"

import { use, useMemo, useState, useEffect } from "react"
import { useListSubmissions } from "~/hooks/api/form-submission"
import { useGetFields } from "~/hooks/api/form-field"
import { Spinner } from "~/components/ui/spinner"
import { Button } from "~/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { DownloadIcon, BarChart2Icon, InboxIcon } from "lucide-react"
import { toast } from "sonner"

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: formId } = use(params)
  const { submissions, isLoading, isError, error } = useListSubmissions(formId)
  const { fields, isLoading: fieldsLoading } = useGetFields(formId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // --- Chart Data: responses per day ---
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach(sub => {
      if (sub.createdAt) {
        const day = new Date(sub.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
        counts[day] = (counts[day] ?? 0) + 1
      }
    })
    return Object.entries(counts).map(([date, count]) => ({ date, count }))
  }, [submissions])

  if (isLoading || fieldsLoading || !mounted) {
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

  // --- CSV Export ---
  const handleExportCSV = () => {
    try {
      const headers = ["#", ...fields.map(f => f.label), "Submitted At"]
      const rows = submissions.map((sub, idx) => {
        const valueMap = new Map((sub.values ?? []).map(v => [v.formFieldId, v.value]))
        const date = sub.createdAt ? new Date(sub.createdAt).toLocaleString() : ""
        return [
          String(idx + 1),
          ...fieldIds.map(fId => valueMap.get(fId) ?? ""),
          date,
        ]
      })

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `responses-${formId}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("CSV exported successfully!")
    } catch {
      toast.error("Failed to export CSV.")
    }
  }



  const latestDate = submissions.length > 0 && submissions[0]?.createdAt
    ? new Date(submissions[0].createdAt).toLocaleDateString()
    : "N/A"

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Response Analytics</h1>
          <p className="text-muted-foreground">
            Manage and analyze responses for this form.
          </p>
        </div>
        {submissions.length > 0 && (
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={handleExportCSV}
          >
            <DownloadIcon className="size-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: "oklch(0.88 0.025 75)", background: "oklch(1 0.005 80)" }}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Responses</h3>
            <InboxIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold" style={{ color: "oklch(0.62 0.19 48)" }}>
            {submissions.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
        </div>

        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: "oklch(0.88 0.025 75)", background: "oklch(1 0.005 80)" }}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Fields</h3>
            <BarChart2Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold" style={{ color: "oklch(0.5 0.14 145)" }}>
            {fields.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Fields collecting data</p>
        </div>

        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: "oklch(0.88 0.025 75)", background: "oklch(1 0.005 80)" }}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Latest Response</h3>
          </div>
          <div className="text-3xl font-bold">{latestDate}</div>
          <p className="text-xs text-muted-foreground mt-1">Most recent submission date</p>
        </div>
      </div>

      {/* Recharts bar chart — responses over time */}
      {chartData.length > 0 && (
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{ borderColor: "oklch(0.88 0.025 75)", background: "oklch(1 0.005 80)" }}
        >
          <h2 className="text-base font-semibold mb-4">Responses Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.025 75)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  border: "1px solid oklch(0.88 0.025 75)",
                }}
              />
              <Bar dataKey="count" name="Responses" fill="oklch(0.62 0.19 48)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">No submissions yet</p>
          <p className="text-sm text-muted-foreground">
            Share your form to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "oklch(0.88 0.025 75)" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: "linear-gradient(90deg, oklch(0.62 0.19 48 / 8%), oklch(0.5 0.14 145 / 5%))" }}>
                <TableHead className="w-12 font-bold">#</TableHead>
                {fieldIds.map(fId => (
                  <TableHead key={fId} className="font-bold">{fieldMap.get(fId) ?? fId}</TableHead>
                ))}
                <TableHead className="font-bold">Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub, idx) => {
                // Build a map from fieldId -> value for this submission
                const valueMap = new Map(
                  (sub.values ?? []).map(v => [v.formFieldId, v.value])
                )

                return (
                  <TableRow key={sub.id} className="hover:bg-[oklch(0.62_0.19_48)/4%] transition-colors">
                    <TableCell className="text-muted-foreground font-medium">
                      {idx + 1}
                    </TableCell>
                    {fieldIds.map(fId => (
                      <TableCell key={fId}>
                        {valueMap.get(fId) || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="text-muted-foreground text-sm">
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
