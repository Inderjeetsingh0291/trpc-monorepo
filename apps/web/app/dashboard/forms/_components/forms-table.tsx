"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileTextIcon, PencilIcon, Share2Icon, ExternalLinkIcon, CopyIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useListForms } from "~/hooks/api/form"

export function FormsTable() {
  const { forms, isLoading, isError, error } = useListForms()
  const [shareFormId, setShareFormId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    if (shareFormId && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/form/${shareFormId}`)
    }
  }, [shareFormId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link.")
    }
  }

  if (isLoading) {
    return <FormsTableSkeleton />
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-12 text-center"
        style={{ borderColor: "oklch(0.577 0.245 27.325 / 40%)" }}
      >
        <p className="text-sm text-destructive font-medium">
          {error?.message ?? "Failed to load forms."}
        </p>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed p-16 text-center"
        style={{
          borderColor: "oklch(0.62 0.19 48 / 30%)",
          background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 5%), oklch(0.5 0.14 145 / 5%))",
        }}
      >
        <div
          className="flex size-16 items-center justify-center rounded-2xl shadow-md"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            boxShadow: "0 0 20px oklch(0.62 0.19 48 / 30%)",
          }}
        >
          <PlusIcon className="size-7 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">No forms yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first form to start collecting responses.
          </p>
        </div>
        <Button
          className="mt-1 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            border: "none",
          }}
          onClick={() => document.getElementById("create-form-button")?.click()}
        >
          Create Your First Form
        </Button>
      </div>
    )
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          border: "1px solid oklch(0.88 0.025 75)",
          background: "oklch(1 0.005 80)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{
                background: "linear-gradient(90deg, oklch(0.62 0.19 48 / 8%), oklch(0.5 0.14 145 / 5%))",
                borderBottom: "1px solid oklch(0.88 0.025 75)",
              }}
            >
              <TableHead className="font-bold text-foreground/80 py-4">Title</TableHead>
              <TableHead className="font-bold text-foreground/80">Description</TableHead>
              <TableHead className="font-bold text-foreground/80">Status</TableHead>
              <TableHead className="font-bold text-foreground/80">Created</TableHead>
              <TableHead className="text-right font-bold text-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form, idx) => (
              <TableRow
                key={form.id}
                className="transition-colors hover:bg-[oklch(0.62_0.19_48)/5%] group"
                style={{ borderBottom: "1px solid oklch(0.88 0.025 75)" }}
              >
                <TableCell className="font-semibold py-4">
                  <Link
                    href={`/dashboard/forms/${form.id}`}
                    className="hover:underline underline-offset-4 transition-colors"
                    style={{ color: "oklch(0.55 0.16 50)" }}
                  >
                    {form.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {form.description || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      form.isActive
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-gray-500 bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${form.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShareFormId(form.id)}
                      className="rounded-lg text-muted-foreground hover:text-[oklch(0.55_0.16_50)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                    >
                      <Share2Icon className="size-4" />
                      <span className="sr-only">Share {form.title}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      className="rounded-lg text-muted-foreground hover:text-[oklch(0.55_0.16_50)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                    >
                      <Link href={`/form/${form.id}`} target="_blank">
                        <ExternalLinkIcon className="size-4" />
                        <span className="sr-only">Preview {form.title}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      className="rounded-lg text-muted-foreground hover:text-[oklch(0.55_0.16_50)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                    >
                      <Link href={`/dashboard/forms/${form.id}`}>
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Edit {form.title}</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!shareFormId} onOpenChange={(open) => !open && setShareFormId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Share Form</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Anyone with this link can submit responses to your form.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div
              className="rounded-2xl p-4 shadow-sm"
              style={{
                background: "oklch(1 0.005 80)",
                border: "1px solid oklch(0.88 0.025 75)",
              }}
            >
              {shareUrl && <QRCodeSVG value={shareUrl} size={180} />}
            </div>
            <div className="flex w-full items-center space-x-2">
              <Input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-xl bg-muted/50 border-border/60 text-sm"
              />
              <Button
                size="icon"
                onClick={copyToClipboard}
                className="rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" }}
              >
                <CopyIcon className="size-4" />
              </Button>
              <Button
                size="icon"
                className="rounded-xl"
                variant="outline"
                onClick={() => window.open(shareUrl, "_blank")}
              >
                <ExternalLinkIcon className="size-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FormsTableSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        border: "1px solid oklch(0.88 0.025 75)",
        background: "oklch(1 0.005 80)",
      }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{
              background: "linear-gradient(90deg, oklch(0.62 0.19 48 / 8%), oklch(0.5 0.14 145 / 5%))",
            }}
          >
            <TableHead className="font-bold text-foreground/80 py-4">Title</TableHead>
            <TableHead className="font-bold text-foreground/80">Description</TableHead>
            <TableHead className="font-bold text-foreground/80">Status</TableHead>
            <TableHead className="font-bold text-foreground/80">Created</TableHead>
            <TableHead className="text-right font-bold text-foreground/80">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i} style={{ borderBottom: "1px solid oklch(0.88 0.025 75)" }}>
              <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 rounded-lg" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
