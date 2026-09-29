"use client"

import { useState } from "react"
import Link from "next/link"
import {
  TrophyIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MinusCircleIcon,
  ClockIcon,
  RotateCcwIcon,
  LightbulbIcon,
  AwardIcon,
  SparklesIcon,
  ChevronDownIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Leaderboard } from "~/components/quiz/leaderboard"
import { useGetResult } from "~/hooks/api/quiz"

interface QuizResultClientProps {
  formId: string
  attemptId: string
}

export function QuizResultClient({ formId, attemptId }: QuizResultClientProps) {
  const { result, isLoading, isError, error } = useGetResult(attemptId)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
        <div className="p-8 rounded-3xl bg-background border border-destructive/30 text-center max-w-md shadow-md">
          <h2 className="text-xl font-bold text-destructive">Unable to load result</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message ?? "Result could not be retrieved."}
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href={`/quiz/${formId}`}>Return to Quiz Landing</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // If results have not been published by the organizer yet
  if (result.resultsPublished === false) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
        style={{
          background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 8%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 6%) 0%, transparent 70%)",
        }}
      >
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border shadow-lg"
            style={{
              background: "linear-gradient(135deg, oklch(0.18 0.05 45) 0%, oklch(0.22 0.07 50) 60%, oklch(0.2 0.05 55) 100%)",
              borderColor: "oklch(0.62 0.19 48 / 40%)",
            }}
          >
            {/* Ambient Glow */}
            <div
              className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-56 rounded-full blur-3xl opacity-35"
              style={{ background: "oklch(0.62 0.19 48)" }}
            />

            <div className="relative z-10 flex flex-col items-center gap-3 text-white">
              <div
                className="flex size-16 items-center justify-center rounded-2xl shadow-lg mb-1"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                <ClockIcon className="size-8 text-white" />
              </div>

              <span
                className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  background: "oklch(0.62 0.19 48 / 25%)",
                  border: "1px solid oklch(0.62 0.19 48 / 45%)",
                }}
              >
                Submission Received • Results Pending
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Quiz Submitted Successfully!
              </h1>

              <p className="text-sm text-white/80 max-w-md">
                Your responses have been recorded and safely saved. The quiz organizer has chosen to release results at a later time.
              </p>

              <div className="w-full mt-4 p-4 rounded-2xl bg-white/10 border border-white/15 text-left flex flex-col gap-2.5 text-xs text-white/90">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status:</span>
                  <Badge variant="outline" className="border-amber-400/50 bg-amber-400/20 text-amber-200 text-[11px] font-semibold">
                    Submitted & Graded (Pending Release)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total Questions:</span>
                  <span className="font-semibold text-white">{result.totalQuestions} questions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Time Taken:</span>
                  <span className="font-semibold text-white">{formatTime(result.timeTaken)}</span>
                </div>
                {result.submittedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Submitted At:</span>
                    <span className="font-semibold text-white">
                      {new Date(result.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 flex-wrap justify-center w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <RotateCcwIcon className="size-4" />
                  Check If Results Published
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <Link href={`/quiz/${formId}`}>
                    Return to Quiz Landing
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center text-xs text-muted-foreground flex flex-col gap-1">
            <span className="font-semibold text-foreground">💡 Note for Participants</span>
            <span>
              Save or bookmark this URL. As soon as the organizer publishes results, your score, pass/fail status, and question review will appear right here.
            </span>
          </div>
        </div>
      </div>
    )
  }

  const passed = result.passed

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8"
      style={{
        background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 6%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 5%) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Hero Card */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border shadow-sm"
          style={{
            background: passed
              ? "linear-gradient(135deg, oklch(0.18 0.06 145) 0%, oklch(0.22 0.08 140) 60%, oklch(0.19 0.06 150) 100%)"
              : "linear-gradient(135deg, oklch(0.18 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 40) 100%)",
            borderColor: passed ? "oklch(0.5 0.14 145 / 40%)" : "oklch(0.62 0.19 48 / 40%)",
          }}
        >
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-56 rounded-full blur-3xl opacity-30"
            style={{
              background: passed ? "oklch(0.5 0.14 145)" : "oklch(0.62 0.19 48)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-3 text-white">
            <div
              className="flex size-16 items-center justify-center rounded-2xl shadow-lg mb-1"
              style={{
                background: passed
                  ? "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.6 0.14 160))"
                  : "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              {passed ? (
                <TrophyIcon className="size-8 text-white" />
              ) : (
                <AwardIcon className="size-8 text-white" />
              )}
            </div>

            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: passed ? "oklch(0.5 0.14 145 / 25%)" : "oklch(0.62 0.19 48 / 25%)",
                border: `1px solid ${
                  passed ? "oklch(0.5 0.14 145 / 40%)" : "oklch(0.62 0.19 48 / 40%)"
                }`,
              }}
            >
              {passed ? "Congratulations! Passed" : "Quiz Completed"}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              You Scored {result.percentage}%
            </h1>

            <p className="text-sm text-white/80 max-w-md">
              {passed
                ? "Excellent performance! You successfully met or exceeded the passing requirement."
                : "Good attempt! Review the answers below to reinforce your understanding."}
            </p>

            <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaderboardOpen(true)}
                className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold gap-1.5 shadow-xs"
              >
                <TrophyIcon className="size-4 text-amber-300" />
                View Leaderboard
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold gap-1.5 shadow-xs"
              >
                <Link href={`/quiz/${formId}`}>
                  <RotateCcwIcon className="size-4" />
                  Retake Quiz
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
            <span className="text-xs text-muted-foreground font-medium">Final Score</span>
            <div className="text-xl font-bold text-foreground">
              {result.score} / {result.totalMarks}
            </div>
            <span className="text-[11px] text-muted-foreground">total points</span>
          </div>

          <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2Icon className="size-3.5" />
              Correct
            </div>
            <div className="text-xl font-bold text-emerald-600">{result.correct}</div>
            <span className="text-[11px] text-muted-foreground">questions</span>
          </div>

          <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
              <XCircleIcon className="size-3.5" />
              Incorrect
            </div>
            <div className="text-xl font-bold text-rose-600">{result.wrong}</div>
            <span className="text-[11px] text-muted-foreground">questions</span>
          </div>

          <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ClockIcon className="size-3.5" />
              Time Taken
            </div>
            <div className="text-xl font-bold text-foreground">{formatTime(result.timeTaken)}</div>
            <span className="text-[11px] text-muted-foreground">completion</span>
          </div>
        </div>

        {/* Question-by-Question Review Section */}
        {result.showCorrectAnswers && result.questionBreakdown && result.questionBreakdown.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Question Review</h2>
                <p className="text-xs text-muted-foreground">
                  Review your answers and learn from the answer keys and explanations.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {result.questionBreakdown.length} Questions
              </Badge>
            </div>

            <div className="flex flex-col gap-4">
              {result.questionBreakdown.map((item: any, idx: number) => {
                const q = item.question
                const isCorrect = item.isCorrect === true
                const userSelectedOptionIds = item.userAnswer?.selectedOptionIds ?? []
                const userTextAnswer = item.userAnswer?.textAnswer ?? ""

                return (
                  <div
                    key={q?.id ?? idx}
                    className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-background shadow-xs flex flex-col gap-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg text-xs font-bold bg-muted text-muted-foreground">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-foreground">
                          {q?.question ?? "Question"}
                        </h3>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          isCorrect
                            ? "border-[oklch(0.5_0.14_145)/40%] bg-[oklch(0.5_0.14_145)/10%] text-[oklch(0.5_0.14_145)] font-semibold"
                            : "border-rose-500/40 bg-rose-500/10 text-rose-600 font-semibold"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2Icon className="size-3 mr-1" />
                            +{item.marksAwarded} marks
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="size-3 mr-1" />
                            {item.marksAwarded} marks
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Options list for MCQ / Multi / TrueFalse */}
                    {item.options && item.options.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        {item.options.map((opt: any) => {
                          const isUserSelection = userSelectedOptionIds.includes(opt.id)
                          const isOptionCorrect = opt.isCorrect === true

                          let style = "border-border/60 bg-muted/20 text-muted-foreground"
                          if (isOptionCorrect) {
                            style =
                              "border-[oklch(0.5_0.14_145)/60%] bg-[oklch(0.5_0.14_145)/10%] text-foreground font-semibold"
                          } else if (isUserSelection && !isOptionCorrect) {
                            style = "border-rose-500/60 bg-rose-500/10 text-foreground"
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm ${style}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`size-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                    isOptionCorrect
                                      ? "bg-[oklch(0.5_0.14_145)] text-white"
                                      : isUserSelection
                                      ? "bg-rose-500 text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isOptionCorrect ? "✓" : isUserSelection ? "✕" : "•"}
                                </span>
                                <span>{opt.optionText}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
                                {isUserSelection && (
                                  <span className="text-muted-foreground">Your answer</span>
                                )}
                                {isOptionCorrect && (
                                  <span className="text-[oklch(0.5_0.14_145)]">
                                    Correct answer
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Text Answer Display for Short Answer / Fill Blank */}
                    {userTextAnswer && (!item.options || item.options.length === 0) && (
                      <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs">
                        <span className="font-semibold text-muted-foreground">Your answer: </span>
                        <span className="font-mono text-foreground font-bold">{userTextAnswer}</span>
                      </div>
                    )}

                    {/* Explanation if present */}
                    {q?.explanation && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <LightbulbIcon className="size-4 shrink-0 text-amber-600 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-amber-800 dark:text-amber-300">
                            Explanation:
                          </span>
                          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Modal */}
      <Leaderboard
        formId={formId}
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
      />
    </div>
  )
}
