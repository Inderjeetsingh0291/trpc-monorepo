"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Share2Icon,
  ExternalLinkIcon,
  CheckIcon,
  CopyIcon,
  BarChart3Icon,
  Edit2Icon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  usePublishQuiz,
  useUnpublishQuiz,
  useUpdateQuiz,
} from "~/hooks/api/quiz"

interface QuizHeaderProps {
  quiz: {
    id: string
    title: string
    description?: string | null
    isActive?: boolean | null
    visibility?: "public" | "unlisted"
    settings?: {
      timeLimitMinutes?: number | null
      passingScore?: number | null
      maxAttempts?: number | null
    } | null
    questions?: any[]
  }
  onRefetch?: () => void
}

export function QuizHeader({ quiz, onRefetch }: QuizHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(quiz.title)
  const [description, setDescription] = useState(quiz.description ?? "")
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { publishQuizAsync, isPending: isPublishing } = usePublishQuiz()
  const { unpublishQuizAsync, isPending: isUnpublishing } = useUnpublishQuiz()
  const { updateQuizAsync, isPending: isUpdating } = useUpdateQuiz()

  const isPending = isPublishing || isUnpublishing || isUpdating

  const handleSaveDetails = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    try {
      await updateQuizAsync({
        formId: quiz.id,
        title: title.trim(),
        description: description.trim() || null,
      })
      toast.success("Quiz details updated")
      setIsEditingTitle(false)
      onRefetch?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update quiz")
    }
  }

  const handleTogglePublish = async () => {
    try {
      if (quiz.isActive) {
        await unpublishQuizAsync({ formId: quiz.id })
        toast.success("Quiz unpublished (saved as draft)")
      } else {
        if (!quiz.questions || quiz.questions.length === 0) {
          toast.error("Please add at least one question before publishing")
          return
        }
        await publishQuizAsync({ formId: quiz.id })
        toast.success("Quiz published successfully!")
      }
      onRefetch?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to change quiz status")
    }
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/quiz/${quiz.id}` : `/quiz/${quiz.id}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success("Quiz link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-sm border border-[oklch(0.88_0.025_75)]"
      style={{
        background: "linear-gradient(135deg, oklch(0.99 0.005 80) 0%, oklch(0.97 0.015 60) 100%)",
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left side: Back button & Title/Desc */}
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-xl border-border/80 shadow-xs shrink-0 mt-0.5 hover:bg-[oklch(0.62_0.19_48)/10%]"
          >
            <Link href="/dashboard/forms">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>

          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex flex-col gap-2 max-w-xl">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quiz title..."
                  className="h-10 text-lg font-bold rounded-xl"
                  autoFocus
                />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description or instructions for quiz takers..."
                  rows={2}
                  className="text-sm rounded-xl resize-none"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="sm"
                    onClick={handleSaveDetails}
                    disabled={isPending}
                    className="rounded-lg text-white"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTitle(quiz.title)
                      setDescription(quiz.description ?? "")
                      setIsEditingTitle(false)
                    }}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {quiz.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    title="Edit title & description"
                  >
                    <Edit2Icon className="size-4" />
                  </button>
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[oklch(0.62_0.19_48)/10%] text-[oklch(0.62_0.19_48)] border-[oklch(0.62_0.19_48)/25%]"
                  >
                    <SparklesIcon className="size-3 mr-1" />
                    Quiz
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      quiz.isActive
                        ? "text-[oklch(0.5_0.14_145)] bg-[oklch(0.5_0.14_145)/10%] border border-[oklch(0.5_0.14_145)/25%]"
                        : "text-muted-foreground bg-muted border border-border"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        quiz.isActive ? "bg-[oklch(0.5_0.14_145)]" : "bg-gray-400"
                      }`}
                    />
                    {quiz.isActive ? "Published" : "Draft"}
                  </span>
                </div>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    {quiz.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="rounded-xl shadow-xs gap-1.5"
          >
            <Share2Icon className="size-4" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl shadow-xs gap-1.5"
          >
            <Link href={`/dashboard/forms/${quiz.id}/quiz-analytics`}>
              <BarChart3Icon className="size-4" />
              Analytics
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl shadow-xs gap-1.5"
          >
            <Link href={`/quiz/${quiz.id}`} target="_blank">
              <ExternalLinkIcon className="size-4" />
              Preview / Take
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={handleTogglePublish}
            disabled={isPending}
            className="rounded-xl font-semibold text-white shadow-xs gap-1.5"
            style={{
              background: quiz.isActive
                ? "oklch(0.45 0.05 45)"
                : "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            {quiz.isActive ? (
              <>
                <EyeOffIcon className="size-4" />
                Unpublish
              </>
            ) : (
              <>
                <EyeIcon className="size-4" />
                Publish Quiz
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Share2Icon className="size-5 text-[oklch(0.62_0.19_48)]" />
              Share Quiz Link
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Anyone with this link will be able to take the quiz.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-3">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="h-10 rounded-xl bg-muted/60 text-xs font-mono"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="rounded-xl text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl border border-border">
              <QRCodeSVG value={publicUrl} size={160} level="M" />
              <p className="text-xs text-muted-foreground mt-3">Scan QR code to take quiz on mobile</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
