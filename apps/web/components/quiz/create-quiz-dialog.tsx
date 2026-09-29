"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrophyIcon, SparklesIcon, ClockIcon, HelpCircleIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { useCreateQuiz } from "~/hooks/api/quiz"

interface CreateQuizDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateQuizDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: CreateQuizDialogProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (setControlledOpen ?? (() => {})) : setInternalOpen

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("")
  const [passingScore, setPassingScore] = useState("50")
  const [maxAttempts, setMaxAttempts] = useState("1")
  const [enableLeaderboard, setEnableLeaderboard] = useState(true)
  const [shuffleQuestions, setShuffleQuestions] = useState(false)

  const { createQuizAsync, isPending } = useCreateQuiz()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("createQuiz") === "true") {
        setOpen(true)
      }
    }
  }, [setOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Quiz title is required")
      return
    }

    try {
      const res = await createQuizAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        timeLimitMinutes: timeLimitMinutes ? Math.max(1, parseInt(timeLimitMinutes, 10)) : undefined,
        passingScore: passingScore ? Math.min(100, Math.max(0, parseInt(passingScore, 10))) : 50,
        maxAttempts: maxAttempts ? Math.max(1, parseInt(maxAttempts, 10)) : 1,
        showResultImmediately: true,
        showCorrectAnswers: true,
        shuffleQuestions,
        shuffleOptions: false,
        enableLeaderboard,
        allowGuests: true,
      })

      toast.success("Interactive quiz created!")
      resetForm()
      setOpen(false)

      if (res?.formId) {
        router.push(`/dashboard/forms/${res.formId}/quiz-builder`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create quiz. Please try again.")
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTimeLimitMinutes("")
    setPassingScore("50")
    setMaxAttempts("1")
    setEnableLeaderboard(true)
    setShuffleQuestions(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            id="create-quiz-button"
            className="rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] gap-2"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            <TrophyIcon className="size-4 text-amber-200" />
            New Quiz
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="rounded-2xl sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-xl shadow-sm text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                <TrophyIcon className="size-5 text-amber-100" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Create New Quiz</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Build an interactive quiz with timer, scoring, question bank, and live leaderboards.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quiz-title" className="text-xs font-semibold">
                Quiz Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="quiz-title"
                placeholder="e.g. Punjab History & Culture Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={55}
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quiz-desc" className="text-xs font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="quiz-desc"
                placeholder="Brief guidelines or instructions for participants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={255}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quiz-time-limit" className="text-xs font-semibold flex items-center gap-1.5">
                  <ClockIcon className="size-3.5 text-muted-foreground" />
                  Time Limit (Mins)
                </Label>
                <Input
                  id="quiz-time-limit"
                  type="number"
                  min={1}
                  placeholder="e.g. 15 (Untimed if empty)"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quiz-passing-score" className="text-xs font-semibold flex items-center gap-1.5">
                  <SparklesIcon className="size-3.5 text-muted-foreground" />
                  Passing Score (%)
                </Label>
                <Input
                  id="quiz-passing-score"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quiz-max-attempts" className="text-xs font-semibold">
                  Max Attempts
                </Label>
                <Input
                  id="quiz-max-attempts"
                  type="number"
                  min={1}
                  max={50}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/20">
                <div className="flex flex-col">
                  <Label htmlFor="quiz-leaderboard" className="text-xs font-semibold cursor-pointer">
                    Leaderboard
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Public ranks</span>
                </div>
                <Switch
                  id="quiz-leaderboard"
                  checked={enableLeaderboard}
                  onCheckedChange={setEnableLeaderboard}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex flex-col">
                <Label htmlFor="quiz-shuffle" className="text-xs font-semibold cursor-pointer">
                  Shuffle Questions
                </Label>
                <span className="text-[10px] text-muted-foreground">Randomize question order for each attempt</span>
              </div>
              <Switch
                id="quiz-shuffle"
                checked={shuffleQuestions}
                onCheckedChange={setShuffleQuestions}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-xl font-semibold text-white shadow-md gap-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Creating Quiz...
                </>
              ) : (
                <>
                  <TrophyIcon className="size-4 text-amber-200" />
                  Create & Launch Builder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
