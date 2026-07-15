"use client"

import Link from "next/link"
import { Inbox, FileText, ArrowRight, Calendar, Sparkles } from "lucide-react"
import { useListForms } from "~/hooks/api/form"
import { Spinner } from "~/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"

export default function SubmissionsDashboardPage() {
  const { forms, isLoading, isError, error } = useListForms()

  if (isLoading) {
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
          {error?.message ?? "Failed to load forms."}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 py-4 md:py-6 px-4 lg:px-8 max-w-6xl">
      {/* Page header with Punjab banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 shadow-sm"
        style={{
          background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
        }}
      >
        {/* Glow effects */}
        <div
          className="pointer-events-none absolute top-0 right-0 size-48 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 size-32 rounded-full blur-3xl opacity-15"
          style={{ background: "oklch(0.5 0.14 145)" }}
        />

        {/* Phulkari dot pattern */}
        <div className="pointer-events-none absolute right-8 top-4 grid grid-cols-4 gap-2 opacity-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="size-1 rounded-full bg-white" />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5"
                style={{
                  background: "oklch(0.62 0.19 48 / 20%)",
                  color: "oklch(0.78 0.16 55)",
                  border: "1px solid oklch(0.62 0.19 48 / 30%)",
                }}
              >
                Responses
              </span>
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "oklch(0.95 0.015 75)" }}
            >
              Your Submissions
            </h1>
            <p style={{ color: "oklch(0.65 0.03 60)" }} className="text-sm">
              Select a form below to view and manage its collected responses.
            </p>
          </div>
        </div>

        {/* Bottom rainbow bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: "linear-gradient(90deg, oklch(0.62 0.19 48), oklch(0.5 0.14 145), oklch(0.7 0.15 75), oklch(0.62 0.19 48))",
          }}
        />
      </div>

      {/* Grid of forms */}
      {forms.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed p-16 text-center"
          style={{
            borderColor: "oklch(0.62 0.19 48 / 30%)",
            background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 5%), oklch(0.5 0.14 145 / 5%))",
          }}
        >
          <div
            className="flex size-16 items-center justify-center rounded-2xl shadow-md bg-white"
            style={{
              boxShadow: "0 0 20px oklch(0.62 0.19 48 / 30%)",
            }}
          >
            <Inbox className="size-7 text-[oklch(0.62_0.19_48)]" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">No forms found</p>
            <p className="text-sm text-muted-foreground mt-1">
              You must create a form and share it before you can view submissions.
            </p>
          </div>
          <Button
            asChild
            className="mt-1 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            <Link href="/dashboard/forms">Create a Form</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card
              key={form.id}
              className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between"
              style={{
                background: "oklch(1 0.005 80)",
                border: "1px solid oklch(0.88 0.025 75)",
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute -top-4 -right-4 size-20 rounded-full blur-2xl opacity-0 transition-opacity group-hover:opacity-40"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.5 0.14 145))",
                }}
              />

              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.62_0.19_48)/10%] border border-[oklch(0.62_0.19_48)/25%]">
                    <FileText className="size-5 text-[oklch(0.62_0.19_48)]" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      form.isActive
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-gray-500 bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-4 line-clamp-1 group-hover:underline underline-offset-4 decoration-[oklch(0.62_0.19_48)]">
                  {form.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2 mt-1">
                  {form.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 mt-auto">
                <div className="h-px bg-border/60 my-4" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <Link
                    href={`/dashboard/forms/${form.id}/submissions`}
                    className="flex items-center gap-1 font-semibold text-[oklch(0.55_0.16_50)] group-hover:text-[oklch(0.62_0.19_48)] transition-colors"
                  >
                    View Responses
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
