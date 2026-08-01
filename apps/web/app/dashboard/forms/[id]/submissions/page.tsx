"use client"

import { use, useMemo, useState, useEffect } from "react"
import { useListSubmissions } from "~/hooks/api/form-submission"
import { useGetFields } from "~/hooks/api/form-field"
import { Spinner } from "~/components/ui/spinner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { DownloadIcon, BarChart2Icon, InboxIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpDownIcon, CalendarIcon, XIcon, ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 10

const DATE_PRESETS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
] as const

type DatePreset = typeof DATE_PRESETS[number]["value"]

function getDateThreshold(preset: DatePreset): Date | null {
  if (preset === "all") return null
  const now = new Date()
  switch (preset) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: formId } = use(params)
  const { submissions, isLoading, isError, error } = useListSubmissions(formId)
  const { fields, isLoading: fieldsLoading } = useGetFields(formId)
  const [mounted, setMounted] = useState(false)

  // Filtering & Pagination state
  const [search, setSearch] = useState("")
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [sortNewest, setSortNewest] = useState(true)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, datePreset, sortNewest])

  // Build a map from fieldId -> field for column headers and detail views
  const fieldMap = useMemo(() => new Map(fields.map(f => [f.id, f])), [fields])
  const fieldIds = useMemo(() => fields.map(f => f.id), [fields])

  // --- Filtered and sorted submissions ---
  const filtered = useMemo(() => {
    let result = [...submissions]

    // Date filter
    const threshold = getDateThreshold(datePreset)
    if (threshold) {
      result = result.filter(sub =>
        sub.createdAt && new Date(sub.createdAt) >= threshold
      )
    }

    // Text search across all field values
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(sub => {
        const vals = sub.values ?? []
        return vals.some(v => v.value?.toLowerCase().includes(q))
      })
    }

    // Sort
    result.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortNewest ? tb - ta : ta - tb
    })

    return result
  }, [submissions, search, datePreset, sortNewest])

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

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

  // --- CSV Export ---
  const handleExportCSV = () => {
    try {
      const headers = ["#", ...fields.map(f => f.label), "Submitted At"]
      const rows = filtered.map((sub, idx) => {
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

  const hasFilters = search.trim() !== "" || datePreset !== "all"

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

      {/* ── Filter Bar ── */}
      {submissions.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
          style={{ borderColor: "oklch(0.88 0.025 75)", background: "oklch(1 0.005 80)" }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search responses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-lg border-border/60 bg-background text-sm h-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          {/* Date Preset */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/30">
            {DATE_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setDatePreset(preset.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  datePreset === preset.value
                    ? "bg-white text-[oklch(0.55_0.16_50)] shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Sort Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortNewest(!sortNewest)}
            className="gap-1.5 rounded-lg h-9 text-xs"
          >
            <ArrowUpDownIcon className="size-3.5" />
            {sortNewest ? "Newest" : "Oldest"}
          </Button>

          {/* Active filter indicator */}
          {hasFilters && (
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {submissions.length}
            </span>
          )}
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "oklch(0.62 0.19 48 / 30%)", background: "oklch(0.62 0.19 48 / 3%)" }}
        >
          <SearchIcon className="size-8 text-muted-foreground/50" />
          <p className="font-medium">No matching responses</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or date filter.
          </p>
          <Button variant="outline" size="sm" className="rounded-lg mt-1" onClick={() => { setSearch(""); setDatePreset("all") }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "oklch(0.88 0.025 75)" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: "linear-gradient(90deg, oklch(0.62 0.19 48 / 8%), oklch(0.5 0.14 145 / 5%))" }}>
                  <TableHead className="w-12 font-bold">#</TableHead>
                  {fieldIds.map(fId => (
                    <TableHead key={fId} className="font-bold">{fieldMap.get(fId)?.label ?? fId}</TableHead>
                  ))}
                  <TableHead className="font-bold">Submitted At</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((sub, idx) => {
                  // Build a map from fieldId -> value for this submission
                  const valueMap = new Map(
                    (sub.values ?? []).map(v => [v.formFieldId, v.value])
                  )
                  const globalIdx = (page - 1) * PAGE_SIZE + idx + 1
                  const isExpanded = expandedId === sub.id

                  return (
                    <>
                      <TableRow
                        key={sub.id}
                        className={`transition-colors cursor-pointer ${isExpanded ? "bg-[oklch(0.62_0.19_48)/6%]" : "hover:bg-[oklch(0.62_0.19_48)/4%]"}`}
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      >
                        <TableCell className="text-muted-foreground font-medium">
                          {globalIdx}
                        </TableCell>
                        {fieldIds.map(fId => (
                          <TableCell key={fId} className="max-w-[200px] truncate">
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
                        <TableCell>
                          <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </TableCell>
                      </TableRow>
                      {/* Expanded detail row */}
                      {isExpanded && (
                        <TableRow key={`${sub.id}-detail`} className="bg-[oklch(0.62_0.19_48)/3%]">
                          <TableCell colSpan={fieldIds.length + 3} className="p-0">
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fieldIds.map(fId => {
                                const f = fieldMap.get(fId)
                                const val = valueMap.get(fId) || "—"
                                return (
                                  <div key={fId} className="rounded-lg border border-border/40 p-3 bg-white">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{f?.label ?? fId}</p>
                                    <p className="text-sm text-foreground break-words">{val}</p>
                                  </div>
                                )
                              })}
                              <div className="rounded-lg border border-border/40 p-3 bg-white">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Submitted At</p>
                                <p className="text-sm text-foreground">
                                  {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "—"}
                                </p>
                              </div>
                              <div className="rounded-lg border border-border/40 p-3 bg-white">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Submission ID</p>
                                <p className="text-xs text-muted-foreground font-mono break-all">{sub.id}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {filtered.length} response{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg h-8 gap-1"
              >
                <ChevronLeftIcon className="size-3.5" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                        page === pageNum
                          ? "text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      style={page === pageNum ? { background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" } : undefined}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg h-8 gap-1"
              >
                Next
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
