"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  TrophyIcon,
  PencilIcon,
  Share2Icon,
  ExternalLinkIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  BarChart3Icon,
  SparklesIcon,
  ClockIcon,
  HelpCircleIcon,
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
import { useListForms, useDeleteForm, useToggleFormStatus } from "~/hooks/api/form"
import { CreateQuizDialog } from "~/components/quiz/create-quiz-dialog"

export function QuizzesClient() {
  const { forms, isLoading, isError, error, refetch } = useListForms()
  const { deleteFormAsync, isPending: isDeleting } = useDeleteForm()
  const { toggleFormStatusAsync, isPending: isToggling } = useToggleFormStatus()

  const [shareFormId, setShareFormId] = useState<string | null>(null)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [publishFormId, setPublishFormId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState("")

  const quizzes = forms.filter((f) => (f as any).type === "quiz")

  useEffect(() => {
    if (shareFormId && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/quiz/${shareFormId}`)
    }
  }, [shareFormId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Quiz link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link.")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteFormId) return
    try {
      await deleteFormAsync({ formId: deleteFormId })
      toast.success("Quiz deleted successfully!")
      setDeleteFormId(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete quiz.")
    }
  }

  const handlePublishToggle = async (formId: string, currentlyActive: boolean | null, currentVisibility: string) => {
    const nextActive = !currentlyActive
    try {
      await toggleFormStatusAsync({
        formId,
        isActive: nextActive,
        ...(nextActive ? { visibility: currentVisibility as "public" | "unlisted" } : {}),
      })
      toast.success(nextActive ? "Quiz published!" : "Quiz unpublished.")
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update quiz status.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-destructive/40 bg-destructive/5">
        <p className="font-bold text-destructive">Failed to load quizzes</p>
        <p className="text-sm text-muted-foreground mt-1">{error?.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80"
        style={{
          background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
        }}
      >
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full blur-3xl opacity-30"
          style={{ background: "oklch(0.62 0.19 48)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full blur-3xl opacity-20"
          style={{ background: "oklch(0.5 0.14 145)" }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 w-fit"
              style={{
                background: "oklch(0.62 0.19 48 / 25%)",
                color: "oklch(0.85 0.15 65)",
                border: "1px solid oklch(0.62 0.19 48 / 40%)",
              }}
            >
              Interactive Quizzes
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Build timed, graded challenges with leaderboards, multi-choice questions, and rich analytics.
            </p>
          </div>

          <CreateQuizDialog />
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed p-12 text-center"
          style={{
            borderColor: "oklch(0.62 0.19 48 / 30%)",
            background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 3%), oklch(0.5 0.14 145 / 3%))",
          }}
        >
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-sm text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <TrophyIcon className="size-7 text-amber-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No quizzes created yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create your first interactive quiz to test knowledge, host competitions, or reward top scorers.
            </p>
          </div>
          <CreateQuizDialog />
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden shadow-sm border border-border/80 bg-background"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border/80">
                <TableHead className="font-bold py-4">Quiz Title</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Visibility</TableHead>
                <TableHead className="font-bold">Created</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow
                  key={quiz.id}
                  className="transition-colors hover:bg-[oklch(0.62_0.19_48)/4%] group border-b border-border/60"
                >
                  <TableCell className="font-semibold py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-9 items-center justify-center rounded-xl shrink-0 shadow-2xs"
                        style={{
                          background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 15%), oklch(0.7 0.2 60 / 15%))",
                          color: "oklch(0.62 0.19 48)",
                          border: "1px solid oklch(0.62 0.19 48 / 30%)",
                        }}
                      >
                        <TrophyIcon className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/dashboard/forms/${quiz.id}/quiz-builder`}
                          className="hover:underline underline-offset-4 text-sm font-bold transition-colors truncate"
                          style={{ color: "oklch(0.55 0.16 50)" }}
                        >
                          {quiz.title}
                        </Link>
                        <span
                          className="text-[10px] uppercase font-bold tracking-wider rounded-md px-1.5 py-0.2 w-fit mt-0.5"
                          style={{
                            background: "oklch(0.62 0.19 48 / 12%)",
                            color: "oklch(0.62 0.19 48)",
                          }}
                        >
                          Interactive Quiz
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                    {quiz.description || <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        quiz.isActive
                          ? "text-[oklch(0.5_0.14_145)] bg-[oklch(0.5_0.14_145)/10%] border border-[oklch(0.5_0.14_145)/25%]"
                          : "text-gray-500 bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${quiz.isActive ? "bg-[oklch(0.5_0.14_145)]" : "bg-gray-400"}`} />
                      {quiz.isActive ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        quiz.visibility === "public"
                          ? "text-[oklch(0.62_0.19_48)] bg-[oklch(0.62_0.19_48)/10%] border border-[oklch(0.62_0.19_48)/25%]"
                          : "text-gray-600 bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {quiz.visibility === "public" ? (
                        <>
                          <GlobeIcon className="size-3" /> Public
                        </>
                      ) : (
                        <>
                          <EyeOffIcon className="size-3" /> Unlisted
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {quiz.createdAt
                      ? new Date(quiz.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Distinct Edit Quiz Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-xl border-[oklch(0.62_0.19_48)/35%] bg-[oklch(0.62_0.19_48)/10%] hover:bg-[oklch(0.62_0.19_48)/20%] text-[oklch(0.62_0.19_48)] font-bold text-xs gap-1.5 h-8 px-2.5 shadow-2xs"
                        title="Edit Quiz in Quiz Builder"
                      >
                        <Link href={`/dashboard/forms/${quiz.id}/quiz-builder`}>
                          <TrophyIcon className="size-3.5 text-amber-500" />
                          <span>Edit Quiz</span>
                        </Link>
                      </Button>

                      {/* Quiz Analytics & Leaderboard */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="rounded-lg text-muted-foreground hover:text-[oklch(0.62_0.19_48)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                        title="Quiz Analytics & Leaderboard"
                      >
                        <Link href={`/dashboard/forms/${quiz.id}/quiz-analytics`}>
                          <BarChart3Icon className="size-4" />
                        </Link>
                      </Button>

                      {/* Take Quiz / Public View */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="rounded-lg text-muted-foreground hover:text-[oklch(0.62_0.19_48)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                        title="Take Quiz (Public)"
                      >
                        <Link href={`/quiz/${quiz.id}`} target="_blank">
                          <ExternalLinkIcon className="size-4" />
                        </Link>
                      </Button>

                      {/* Publish / Unpublish Toggle */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handlePublishToggle(quiz.id, quiz.isActive, quiz.visibility)}
                        disabled={isToggling}
                        className={`rounded-lg ${
                          quiz.isActive
                            ? "text-[oklch(0.5_0.14_145)] hover:text-[oklch(0.5_0.14_145)] hover:bg-[oklch(0.5_0.14_145)/10%]"
                            : "text-muted-foreground hover:text-[oklch(0.5_0.14_145)] hover:bg-[oklch(0.5_0.14_145)/10%]"
                        }`}
                        title={quiz.isActive ? "Unpublish Quiz" : "Publish Quiz"}
                      >
                        {quiz.isActive ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                      </Button>

                      {/* Share */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShareFormId(quiz.id)}
                        className="rounded-lg text-muted-foreground hover:text-[oklch(0.55_0.16_50)] hover:bg-[oklch(0.62_0.19_48)/10%]"
                        title="Share Quiz Link & QR"
                      >
                        <Share2Icon className="size-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteFormId(quiz.id)}
                        className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Quiz Permanently"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Share Modal */}
      <Dialog open={!!shareFormId} onOpenChange={(open) => !open && setShareFormId(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2Icon className="size-5 text-[oklch(0.62_0.19_48)]" />
              Share Quiz
            </DialogTitle>
            <DialogDescription>
              Copy the direct URL or scan the QR code to take this quiz.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="rounded-xl font-mono text-xs" />
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="rounded-xl shrink-0 font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                <CopyIcon className="size-3.5 mr-1" />
                Copy
              </Button>
            </div>

            {shareUrl && (
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/30 border border-border/70">
                <QRCodeSVG value={shareUrl} size={160} level="M" />
                <span className="text-[11px] text-muted-foreground mt-2">
                  Scan to take quiz on mobile
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteFormId} onOpenChange={(open) => !open && setDeleteFormId(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2Icon className="size-5" />
              Delete Quiz
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this quiz? All questions, options, participant attempts, and leaderboard entries will be permanently erased.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteFormId(null)}
              className="rounded-xl"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="rounded-xl font-semibold"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
