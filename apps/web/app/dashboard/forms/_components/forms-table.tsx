"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileTextIcon,
  PencilIcon,
  Share2Icon,
  ExternalLinkIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  CopyPlusIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  TrophyIcon,
  BarChart3Icon,
} from "lucide-react"
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
import { useListForms, useDeleteForm, useToggleFormStatus, useCloneForm, useArchiveForm, useRestoreForm, useListArchivedForms } from "~/hooks/api/form"

export function FormsTable() {
  const { forms, isLoading, isError, error } = useListForms()
  const { forms: archivedForms, isLoading: archivedLoading } = useListArchivedForms()
  const { deleteFormAsync, isPending: isDeleting } = useDeleteForm()
  const { toggleFormStatusAsync, isPending: isToggling } = useToggleFormStatus()
  const { cloneFormAsync, isPending: isCloning } = useCloneForm()
  const { archiveFormAsync, isPending: isArchiving } = useArchiveForm()
  const { restoreFormAsync, isPending: isRestoring } = useRestoreForm()

  const [activeTab, setActiveTab] = useState<"all" | "forms" | "quizzes" | "archived">("all")
  const [shareFormId, setShareFormId] = useState<string | null>(null)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [publishFormId, setPublishFormId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")

  const handleArchive = async (formId: string, title: string) => {
    try {
      await archiveFormAsync({ formId })
      toast.success(`"${title}" moved to archive.`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to archive form.")
    }
  }

  const handleRestore = async (formId: string, title: string) => {
    try {
      await restoreFormAsync({ formId })
      toast.success(`"${title}" restored from archive.`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to restore form.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteFormId) return

    try {
      await deleteFormAsync({ formId: deleteFormId })
      toast.success("Form deleted successfully!")
      setDeleteFormId(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete form.")
    }
  }

  const handlePublishToggle = async (formId: string, currentlyActive: boolean | null, currentVisibility: string) => {
    const nextActive = !currentlyActive
    // When publishing, keep existing visibility; when unpublishing just flip isActive
    try {
      await toggleFormStatusAsync({
        formId,
        isActive: nextActive,
        ...(nextActive ? { visibility: currentVisibility as "public" | "unlisted" } : {}),
      })
      toast.success(nextActive ? "Form published!" : "Form unpublished.")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update form status.")
    }
  }

  const handleSetVisibility = async (formId: string, visibility: "public" | "unlisted") => {
    try {
      await toggleFormStatusAsync({ formId, isActive: true, visibility })
      setPublishFormId(null)
      toast.success(`Form set to ${visibility === "public" ? "Public" : "Unlisted"}.`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update visibility.")
    }
  }

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
    const isAuthError = error?.message?.toLowerCase().includes("not logged in")

    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-10 text-center"
        style={{
          borderColor: isAuthError ? "oklch(0.62 0.19 48 / 30%)" : "oklch(0.577 0.245 27.325 / 40%)",
          background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 4%), oklch(0.5 0.14 145 / 4%))",
        }}
      >
        <div>
          <p className="text-base font-bold text-foreground">
            {isAuthError ? "Authentication Required" : "Failed to load forms"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthError
              ? "Please log in to view and manage your forms."
              : (error?.message ?? "An error occurred while loading your forms.")}
          </p>
        </div>
        {isAuthError && (
          <Button
            asChild
            size="sm"
            className="rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            <Link href="/login">Log In</Link>
          </Button>
        )}
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

  const formsOnly = forms.filter((f) => (f as any).type !== "quiz")
  const quizzesOnly = forms.filter((f) => (f as any).type === "quiz")

  const currentForms =
    activeTab === "archived"
      ? archivedForms
      : activeTab === "forms"
      ? formsOnly
      : activeTab === "quizzes"
      ? quizzesOnly
      : forms

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
          style={activeTab === "all" ? { background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" } : undefined}
        >
          All Items ({forms.length})
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "forms"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
          style={activeTab === "forms" ? { background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.58 0.15 155))" } : undefined}
        >
          <FileTextIcon className="size-3.5" />
          Forms ({formsOnly.length})
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "quizzes"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
          style={activeTab === "quizzes" ? { background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" } : undefined}
        >
          <TrophyIcon className="size-3.5 text-amber-200" />
          Quizzes ({quizzesOnly.length})
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "archived"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted"
          }`}
          style={activeTab === "archived" ? { background: "linear-gradient(135deg, oklch(0.4 0.05 30), oklch(0.3 0.05 30))" } : undefined}
        >
          <ArchiveIcon className="size-3.5" />
          Archived ({archivedForms.length})
        </button>
      </div>

      {currentForms.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center"
          style={{
            borderColor: "oklch(0.62 0.19 48 / 30%)",
            background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 3%), oklch(0.5 0.14 145 / 3%))",
          }}
        >
          <ArchiveIcon className="size-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">
            {activeTab === "archived"
              ? "No archived items"
              : activeTab === "quizzes"
              ? "No quizzes found"
              : activeTab === "forms"
              ? "No forms found"
              : "No items found"}
          </p>
          <p className="text-xs text-muted-foreground">
            {activeTab === "archived"
              ? "Forms or quizzes you archive will appear here."
              : activeTab === "quizzes"
              ? "Create an interactive quiz to challenge participants."
              : "Create a new form or quiz to get started."}
          </p>
        </div>
      ) : (
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
                <TableHead className="font-bold text-foreground/80">Visibility</TableHead>
                <TableHead className="font-bold text-foreground/80">Created</TableHead>
                <TableHead className="text-right font-bold text-foreground/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentForms.map((form) => {
                const isQuiz = (form as any).type === "quiz"

                return (
                  <TableRow
                    key={form.id}
                    className="transition-colors hover:bg-[oklch(0.62_0.19_48)/5%] group"
                    style={{ borderBottom: "1px solid oklch(0.88 0.025 75)" }}
                  >
                    <TableCell className="font-semibold py-4">
                      {isQuiz ? (
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-8 items-center justify-center rounded-xl shrink-0 shadow-2xs"
                            style={{
                              background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 15%), oklch(0.7 0.2 60 / 15%))",
                              color: "oklch(0.62 0.19 48)",
                              border: "1px solid oklch(0.62 0.19 48 / 30%)",
                            }}
                          >
                            <TrophyIcon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            {activeTab !== "archived" ? (
                              <Link
                                href={`/dashboard/forms/${form.id}/quiz-builder`}
                                className="hover:underline underline-offset-4 text-sm font-bold transition-colors truncate"
                                style={{ color: "oklch(0.55 0.16 50)" }}
                              >
                                {form.title}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-sm font-bold">{form.title}</span>
                            )}
                            <span
                              className="text-[10px] uppercase font-bold tracking-wider rounded-md px-1.5 py-0.2 w-fit mt-0.5"
                              style={{
                                background: "oklch(0.62 0.19 48 / 12%)",
                                color: "oklch(0.62 0.19 48)",
                              }}
                            >
                              Quiz
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-8 items-center justify-center rounded-xl shrink-0 shadow-2xs"
                            style={{
                              background: "linear-gradient(135deg, oklch(0.5 0.14 145 / 15%), oklch(0.58 0.15 155 / 15%))",
                              color: "oklch(0.5 0.14 145)",
                              border: "1px solid oklch(0.5 0.14 145 / 30%)",
                            }}
                          >
                            <FileTextIcon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            {activeTab !== "archived" ? (
                              <Link
                                href={`/dashboard/forms/${form.id}`}
                                className="hover:underline underline-offset-4 text-sm font-semibold transition-colors truncate text-foreground"
                              >
                                {form.title}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-sm">{form.title}</span>
                            )}
                            <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground mt-0.5">
                              Form
                            </span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  <TableCell className="text-muted-foreground">
                    {form.description || <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        form.isActive
                          ? "text-[oklch(0.5_0.14_145)] bg-[oklch(0.5_0.14_145)/10%] border border-[oklch(0.5_0.14_145)/25%]"
                          : "text-gray-500 bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${form.isActive ? "bg-[oklch(0.5_0.14_145)]" : "bg-gray-400"}`} />
                      {form.isActive ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        activeTab !== "archived" && form.isActive ? "cursor-pointer" : ""
                      } ${
                        form.visibility === "public"
                          ? "text-[oklch(0.62_0.19_48)] bg-[oklch(0.62_0.19_48)/10%] border border-[oklch(0.62_0.19_48)/25%]"
                          : "text-gray-600 bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => activeTab !== "archived" && form.isActive && setPublishFormId(form.id)}
                    >
                      {form.visibility === "public"
                        ? <><GlobeIcon className="size-3" /> Public</>
                        : <><EyeOffIcon className="size-3" /> Unlisted</>
                      }
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
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {activeTab !== "archived" ? (
                        <>
                          {/* Distinct Primary Edit Option */}
                          {isQuiz ? (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="rounded-xl border-[oklch(0.62_0.19_48)/35%] bg-[oklch(0.62_0.19_48)/10%] hover:bg-[oklch(0.62_0.19_48)/20%] text-[oklch(0.62_0.19_48)] font-bold text-xs gap-1.5 h-8 px-2.5 shadow-2xs"
                              title="Edit Quiz in Quiz Builder"
                            >
                              <Link href={`/dashboard/forms/${form.id}/quiz-builder`}>
                                <TrophyIcon className="size-3.5 text-amber-500" />
                                <span>Edit Quiz</span>
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="rounded-xl border-[oklch(0.5_0.14_145)/35%] bg-[oklch(0.5_0.14_145)/10%] hover:bg-[oklch(0.5_0.14_145)/20%] text-[oklch(0.5_0.14_145)] font-bold text-xs gap-1.5 h-8 px-2.5 shadow-2xs"
                              title="Edit Form in Form Builder"
                            >
                              <Link href={`/dashboard/forms/${form.id}`}>
                                <PencilIcon className="size-3.5" />
                                <span>Edit Form</span>
                              </Link>
                            </Button>
                          )}

                          {/* Analytics / Submissions */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className={`rounded-lg ${
                              isQuiz
                                ? "text-muted-foreground hover:text-[oklch(0.62_0.19_48)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                                : "text-muted-foreground hover:text-[oklch(0.5_0.14_145)] hover:bg-[oklch(0.5_0.14_145)/10%]"
                            }`}
                            title={isQuiz ? "Quiz Analytics & Leaderboard" : "View Submissions"}
                          >
                            <Link href={isQuiz ? `/dashboard/forms/${form.id}/quiz-analytics` : `/dashboard/forms/${form.id}/submissions`}>
                              {isQuiz ? <BarChart3Icon className="size-4" /> : <FileTextIcon className="size-4" />}
                            </Link>
                          </Button>

                          {/* Public Link / Preview */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="rounded-lg text-muted-foreground hover:text-[oklch(0.62_0.19_48)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                            title={isQuiz ? "Take Quiz (Public)" : "Preview Form (Public)"}
                          >
                            <Link href={isQuiz ? `/quiz/${form.id}` : `/form/${form.id}`} target="_blank">
                              <ExternalLinkIcon className="size-4" />
                            </Link>
                          </Button>

                          {/* Publish / Unpublish Toggle */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handlePublishToggle(form.id, form.isActive, form.visibility)}
                            disabled={isToggling}
                            className={`rounded-lg ${
                              form.isActive
                                ? "text-[oklch(0.5_0.14_145)] hover:text-[oklch(0.5_0.14_145)] hover:bg-[oklch(0.5_0.14_145)/10%]"
                                : "text-muted-foreground hover:text-[oklch(0.5_0.14_145)] hover:bg-[oklch(0.5_0.14_145)/10%]"
                            }`}
                            title={form.isActive ? "Unpublish" : "Publish"}
                          >
                            {form.isActive ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                          </Button>

                          {/* Share */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShareFormId(form.id)}
                            className="rounded-lg text-muted-foreground hover:text-[oklch(0.55_0.16_50)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                            title="Share Link & QR"
                          >
                            <Share2Icon className="size-4" />
                          </Button>

                          {/* Clone */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={async () => {
                              try {
                                await cloneFormAsync({ formId: form.id })
                                toast.success(`"${form.title}" cloned as draft!`)
                              } catch (err: any) {
                                toast.error(err?.message ?? "Failed to clone.")
                              }
                            }}
                            disabled={isCloning}
                            className="rounded-lg text-muted-foreground hover:text-[oklch(0.62_0.19_48)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                            title="Clone as Draft"
                          >
                            <CopyPlusIcon className="size-4" />
                          </Button>

                          {/* Archive */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleArchive(form.id, form.title)}
                            disabled={isArchiving}
                            className="rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                            title="Archive"
                          >
                            <ArchiveIcon className="size-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteFormId(form.id)}
                            className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete Permanently"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Restore */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(form.id, form.title)}
                            disabled={isRestoring}
                            className="rounded-xl border-[oklch(0.5_0.14_145)/30%] bg-[oklch(0.5_0.14_145)/10%] hover:bg-[oklch(0.5_0.14_145)/20%] text-[oklch(0.5_0.14_145)] font-semibold text-xs gap-1.5 h-8 px-2.5"
                          >
                            <ArchiveRestoreIcon className="size-3.5" />
                            Restore
                          </Button>
                          {/* Permanent Delete */}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteFormId(form.id)}
                            className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Permanently Delete"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            </TableBody>
          </Table>
        </div>
      )}

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

      <Dialog open={!!deleteFormId} onOpenChange={(open) => !open && !isDeleting && setDeleteFormId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">Delete Form</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete this form? This will permanently delete the form, all of its fields, and all collected submission data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteFormId(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Form"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility Picker Dialog */}
      <Dialog open={!!publishFormId} onOpenChange={(open) => !open && !isToggling && setPublishFormId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Set Form Visibility</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose how this form appears to respondents.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <button
              onClick={() => publishFormId && handleSetVisibility(publishFormId, "public")}
              disabled={isToggling}
              className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-[oklch(0.62_0.19_48)/5%] hover:border-[oklch(0.62_0.19_48)/40%] disabled:opacity-60"
              style={{ border: "1px solid oklch(0.88 0.025 75)" }}
            >
              <GlobeIcon className="mt-0.5 size-5 shrink-0 text-[oklch(0.62_0.19_48)]" />
              <div>
                <p className="font-semibold text-sm text-foreground">Public</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shown in explore pages and public galleries. Anyone can open and submit.
                </p>
              </div>
            </button>
            <button
              onClick={() => publishFormId && handleSetVisibility(publishFormId, "unlisted")}
              disabled={isToggling}
              className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60"
              style={{ border: "1px solid oklch(0.88 0.025 75)" }}
            >
              <EyeOffIcon className="mt-0.5 size-5 shrink-0 text-gray-500" />
              <div>
                <p className="font-semibold text-sm text-foreground">Unlisted</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hidden from public listings. Only people with the direct link can access it.
                </p>
              </div>
            </button>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPublishFormId(null)} disabled={isToggling}>
              Cancel
            </Button>
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
            <TableHead className="font-bold text-foreground/80">Visibility</TableHead>
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
