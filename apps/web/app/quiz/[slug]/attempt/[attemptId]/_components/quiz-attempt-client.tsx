"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  SendIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  SparklesIcon,
  CheckIcon,
  MenuIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet"

import { QuizTimer } from "~/components/quiz/quiz-timer"
import { QuestionNavigator } from "~/components/quiz/question-navigator"
import { QuestionMCQ } from "~/components/quiz/question-mcq"
import { QuestionMultiSelect } from "~/components/quiz/question-multi-select"
import { QuestionTrueFalse } from "~/components/quiz/question-true-false"
import { QuestionShortAnswer } from "~/components/quiz/question-short-answer"
import { QuestionFillBlank } from "~/components/quiz/question-fill-blank"

import {
  useGetAttempt,
  useGetQuizPublic,
  useSaveAnswer,
  useSubmitAttempt,
} from "~/hooks/api/quiz"

interface QuizAttemptClientProps {
  formId: string
  attemptId: string
}

interface UserAnswer {
  selectedOptionIds: string[]
  textAnswer: string
}

export function QuizAttemptClient({ formId, attemptId }: QuizAttemptClientProps) {
  const router = useRouter()
  const { attempt, answers: initialAnswers, isLoading: isAttemptLoading } = useGetAttempt(attemptId)
  const { quiz, isLoading: isQuizLoading } = useGetQuizPublic(formId)
  const { saveAnswerAsync } = useSaveAnswer()
  const { submitAttemptAsync, isPending: isSubmitting } = useSubmitAttempt()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "idle">("idle")
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Track save debounce timers & queued unsaved answers per question
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingQueueRef = useRef<Map<string, UserAnswer>>(new Map())

  // Retry saving queued answers
  const retrySave = useCallback(async () => {
    if (pendingQueueRef.current.size === 0) return
    setSaveStatus("saving")

    const entries = Array.from(pendingQueueRef.current.entries())
    let hasFailure = false

    for (const [qId, ans] of entries) {
      try {
        await saveAnswerAsync({
          attemptId,
          questionId: qId,
          selectedOptionIds: ans.selectedOptionIds,
          textAnswer: ans.textAnswer.trim() || null,
        })
        pendingQueueRef.current.delete(qId)
      } catch {
        hasFailure = true
      }
    }

    if (hasFailure) {
      setSaveStatus("error")
    } else {
      setSaveStatus("saved")
    }
  }, [attemptId, saveAnswerAsync])

  // Warn before closing if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingQueueRef.current.size > 0 || saveStatus === "saving") {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveStatus])

  // Redirect if already completed
  useEffect(() => {
    if (attempt?.status === "SUBMITTED" || attempt?.status === "EXPIRED") {
      router.replace(`/quiz/${formId}/result/${attemptId}`)
    }
  }, [attempt?.status, formId, attemptId, router])

  // Populate answers from server attempt
  useEffect(() => {
    if (initialAnswers && initialAnswers.length > 0) {
      const answersMap: Record<string, UserAnswer> = {}
      for (const ans of initialAnswers) {
        answersMap[ans.questionId] = {
          selectedOptionIds: ans.selectedOptionIds ?? [],
          textAnswer: ans.textAnswer ?? "",
        }
      }
      setUserAnswers((prev) => ({ ...answersMap, ...prev }))
    }
  }, [initialAnswers])

  // Filter & sort questions (honoring attempt.selectedQuestionIds if set for random subset)
  const questions = useMemo(() => {
    if (!quiz?.questions) return []
    if (attempt?.selectedQuestionIds && attempt.selectedQuestionIds.length > 0) {
      const qMap = new Map(quiz.questions.map((q: any) => [q.id, q]))
      return attempt.selectedQuestionIds
        .map((id: string) => qMap.get(id))
        .filter(Boolean)
    }
    return quiz.questions
  }, [quiz?.questions, attempt?.selectedQuestionIds])

  const currentQuestion = questions[currentIndex]

  // Calculate answered questions
  const answeredQuestionIndices = useMemo(() => {
    const indices: number[] = []
    questions.forEach((q: any, idx: number) => {
      const ans = userAnswers[q.id]
      if (!ans) return
      if (ans.selectedOptionIds.length > 0 || (ans.textAnswer && ans.textAnswer.trim().length > 0)) {
        indices.push(idx)
      }
    })
    return indices
  }, [questions, userAnswers])

  const flaggedQuestionIndices = useMemo(() => {
    const indices: number[] = []
    questions.forEach((q: any, idx: number) => {
      if (flaggedIds.has(q.id)) {
        indices.push(idx)
      }
    })
    return indices
  }, [questions, flaggedIds])

  // Auto-save logic with queue & retry
  const triggerAutoSave = useCallback(
    (questionId: string, updatedAnswer: UserAnswer) => {
      pendingQueueRef.current.set(questionId, updatedAnswer)
      setSaveStatus("saving")

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveAnswerAsync({
            attemptId,
            questionId,
            selectedOptionIds: updatedAnswer.selectedOptionIds,
            textAnswer: updatedAnswer.textAnswer.trim() || null,
          })
          pendingQueueRef.current.delete(questionId)
          if (pendingQueueRef.current.size === 0) {
            setSaveStatus("saved")
          }
        } catch {
          setSaveStatus("error")
        }
      }, 300)
    },
    [attemptId, saveAnswerAsync]
  )

  // Handlers for different question types
  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return
    const updated: UserAnswer = {
      selectedOptionIds: [optionId],
      textAnswer: "",
    }
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }))
    triggerAutoSave(currentQuestion.id, updated)
  }

  const handleOptionToggle = (optionId: string) => {
    if (!currentQuestion) return
    const current = userAnswers[currentQuestion.id]?.selectedOptionIds ?? []
    const updatedIds = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]

    const updated: UserAnswer = {
      selectedOptionIds: updatedIds,
      textAnswer: "",
    }
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }))
    triggerAutoSave(currentQuestion.id, updated)
  }

  const handleTextAnswerChange = (text: string) => {
    if (!currentQuestion) return
    const updated: UserAnswer = {
      selectedOptionIds: [],
      textAnswer: text,
    }
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }))
    triggerAutoSave(currentQuestion.id, updated)
  }

  const handleToggleFlag = () => {
    if (!currentQuestion) return
    setFlaggedIds((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id)
      } else {
        next.add(currentQuestion.id)
      }
      return next
    })
  }

  // Submit attempt
  const handleSubmit = async () => {
    try {
      if (pendingQueueRef.current.size > 0) {
        await retrySave()
      }
      await submitAttemptAsync({ attemptId })
      toast.success("Quiz submitted successfully!")
      router.replace(`/quiz/${formId}/result/${attemptId}`)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit quiz.")
    }
  }

  // Auto-submit on timer expiry
  const handleAutoSubmit = async () => {
    toast.warning("Time limit expired! Automatically submitting your answers...")
    try {
      await submitAttemptAsync({ attemptId })
      router.replace(`/quiz/${formId}/result/${attemptId}`)
    } catch {
      router.replace(`/quiz/${formId}/result/${attemptId}`)
    }
  }

  if (isAttemptLoading || isQuizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
        <div className="p-8 rounded-2xl bg-background border border-border text-center">
          <p className="font-semibold text-foreground">No questions found in this quiz.</p>
        </div>
      </div>
    )
  }

  const currentAnswer = userAnswers[currentQuestion.id]
  const isFlagged = flaggedIds.has(currentQuestion.id)
  const isLastQuestion = currentIndex === questions.length - 1
  const answeredPercentage = Math.round(
    (answeredQuestionIndices.length / questions.length) * 100
  )

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{
        backgroundImage: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 4%) 0%, transparent 60%)",
      }}
    >
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-xl shadow-xs"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              <SparklesIcon className="size-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                {quiz.title}
              </h1>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                {saveStatus === "saving" && "Saving answer..."}
                {saveStatus === "saved" && "✓ Answer saved"}
                {saveStatus === "idle" && "All changes autosaved"}
                {saveStatus === "error" && (
                  <button
                    type="button"
                    onClick={retrySave}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    ⚠️ Save failed — Click to retry
                  </button>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <QuizTimer
              expiresAt={attempt?.expiresAt}
              onExpire={handleAutoSubmit}
            />

            {/* Mobile Navigator trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl px-2.5">
                    <MenuIcon className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="rounded-l-2xl p-4 w-[280px]">
                  <SheetHeader className="mb-2">
                    <SheetTitle className="text-sm font-bold">Questions</SheetTitle>
                  </SheetHeader>
                  <QuestionNavigator
                    totalQuestions={questions.length}
                    currentIndex={currentIndex}
                    answeredIndices={answeredQuestionIndices}
                    flaggedIndices={flaggedQuestionIndices}
                    onSelectQuestion={(idx) => {
                      setCurrentIndex(idx)
                      setMobileNavOpen(false)
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Submit Quiz Button */}
            <Button
              size="sm"
              onClick={() => setSubmitDialogOpen(true)}
              className="rounded-xl font-semibold text-white shadow-xs gap-1.5"
              style={{
                background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.6 0.14 160))",
                border: "none",
              }}
            >
              <SendIcon className="size-3.5" />
              <span className="hidden sm:inline">Submit Quiz</span>
              <span className="sm:hidden">Submit</span>
            </Button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              {answeredQuestionIndices.length}/{questions.length} Answered ({answeredPercentage}%)
            </span>
          </div>
          <Progress value={answeredPercentage} className="h-1.5 rounded-full" />
        </div>
      </header>

      {/* Main Taking Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Question Area (Left 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-background/95 shadow-xs flex flex-col gap-6">
            {/* Question Header & Meta */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                  }}
                >
                  {currentIndex + 1}
                </span>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}
                </Badge>
              </div>

              {/* Bookmark / Flag toggle */}
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isFlagged
                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <BookmarkIcon className={`size-3.5 ${isFlagged ? "fill-current" : ""}`} />
                <span>{isFlagged ? "Flagged for Review" : "Flag for Review"}</span>
              </button>
            </div>

            {/* Prompt */}
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {currentQuestion.question}
            </h2>

            {/* Options / Inputs by Type */}
            <div className="pt-2">
              {currentQuestion.questionType === "MCQ" && (
                <QuestionMCQ
                  options={currentQuestion.options ?? []}
                  selectedOptionId={currentAnswer?.selectedOptionIds[0] ?? null}
                  onSelect={handleOptionSelect}
                />
              )}

              {currentQuestion.questionType === "MULTIPLE_SELECT" && (
                <QuestionMultiSelect
                  options={currentQuestion.options ?? []}
                  selectedOptionIds={currentAnswer?.selectedOptionIds ?? []}
                  onToggle={handleOptionToggle}
                />
              )}

              {currentQuestion.questionType === "TRUE_FALSE" && (
                <QuestionTrueFalse
                  options={currentQuestion.options ?? []}
                  selectedOptionId={currentAnswer?.selectedOptionIds[0] ?? null}
                  onSelect={handleOptionSelect}
                />
              )}

              {currentQuestion.questionType === "SHORT_ANSWER" && (
                <QuestionShortAnswer
                  value={currentAnswer?.textAnswer ?? ""}
                  onChange={handleTextAnswerChange}
                />
              )}

              {currentQuestion.questionType === "FILL_BLANK" && (
                <QuestionFillBlank
                  value={currentAnswer?.textAnswer ?? ""}
                  onChange={handleTextAnswerChange}
                />
              )}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 p-2">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="rounded-xl px-4 gap-1.5"
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                className="rounded-xl font-semibold text-white px-5 shadow-xs gap-1.5"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.6 0.14 160))",
                  border: "none",
                }}
              >
                <SendIcon className="size-4" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                className="rounded-xl font-semibold text-white px-5 shadow-xs gap-1.5"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                  border: "none",
                }}
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar Question Navigator (Desktop only) */}
        <div className="hidden lg:block sticky top-28">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answeredIndices={answeredQuestionIndices}
            flaggedIndices={flaggedQuestionIndices}
            onSelectQuestion={setCurrentIndex}
          />
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <SendIcon className="size-5 text-[oklch(0.5_0.14_145)]" />
              Submit Quiz?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Make sure you have reviewed your answers before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-3">
            <div className="p-3 rounded-xl bg-[oklch(0.5_0.14_145)/10%] border border-[oklch(0.5_0.14_145)/20%] text-center">
              <span className="text-xs text-muted-foreground">Answered</span>
              <div className="text-xl font-bold text-[oklch(0.5_0.14_145)]">
                {answeredQuestionIndices.length} / {questions.length}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border text-center">
              <span className="text-xs text-muted-foreground">Unanswered</span>
              <div className="text-xl font-bold text-foreground">
                {questions.length - answeredQuestionIndices.length}
              </div>
            </div>
          </div>

          {flaggedQuestionIndices.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700">
              <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
              <span>
                You have {flaggedQuestionIndices.length} question(s) marked for review.
              </span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Back to Quiz
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.6 0.14 160))",
                border: "none",
              }}
            >
              {isSubmitting ? "Grading..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
