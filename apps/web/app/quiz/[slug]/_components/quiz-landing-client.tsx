"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AwardIcon,
  ClockIcon,
  HelpCircleIcon,
  TrophyIcon,
  LockIcon,
  UserIcon,
  MailIcon,
  PlayIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TimerIcon,
  CalendarIcon,
  AlertCircleIcon,
  HistoryIcon,
  ChevronRightIcon,
  EyeIcon,
  RotateCcwIcon,
  HomeIcon,
  SparklesIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import { Leaderboard } from "~/components/quiz/leaderboard"
import { useGetQuizPublic, useStartAttempt, useGetPreviousAttempts } from "~/hooks/api/quiz"

interface QuizLandingClientProps {
  formId: string
}

// Format seconds → "2m 30s" or "45s"
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// Format date → "Sep 29, 2025 · 3:45 PM"
function formatDate(date: Date | string | null): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function QuizLandingClient({ formId }: QuizLandingClientProps) {
  const router = useRouter()
  const { quiz, isLoading, isError, error, refetch, isFetching } = useGetQuizPublic(formId)
  const { startAttemptAsync, isPending } = useStartAttempt()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      const res = await refetch()
      if (res.data?.quiz?.isActive) {
        toast.success("Quiz is now open! Good luck! 🎉")
      } else {
        toast.info("Quiz is still not open yet. Check back soon!")
      }
    } catch {
      toast.error("Could not check status. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [debouncedEmail, setDebouncedEmail] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Restore saved email and name from localStorage on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("quiz_participant_email")
      const savedName = localStorage.getItem("quiz_participant_name")
      if (savedEmail) {
        setParticipantEmail(savedEmail)
        setDebouncedEmail(savedEmail.trim().toLowerCase())
      }
      if (savedName) {
        setParticipantName(savedName)
      }
    } catch {}
  }, [])

  // Debounce email so we don't fire a query on every keystroke (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = participantEmail.trim().toLowerCase()
    debounceRef.current = setTimeout(() => {
      setDebouncedEmail(trimmed)
      if (trimmed) {
        try { localStorage.setItem("quiz_participant_email", trimmed) } catch {}
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [participantEmail])

  // Save participant name to localStorage
  useEffect(() => {
    if (participantName.trim()) {
      try { localStorage.setItem("quiz_participant_name", participantName.trim()) } catch {}
    }
  }, [participantName])

  const { previousAttempts, totalAttempts, resultsPublished, isLoading: isLoadingHistory } =
    useGetPreviousAttempts(formId, debouncedEmail)

  const latestSubmittedAttempt = previousAttempts.find(a => a.status === "SUBMITTED")

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!participantName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    if (!participantEmail.trim()) {
      toast.error("Email address is required to take this quiz")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(participantEmail.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    if (quiz?.settings?.accessCode && !accessCode.trim()) {
      toast.error("Access code is required to take this quiz")
      return
    }

    try {
      const res = await startAttemptAsync({
        formId,
        participantName: participantName.trim(),
        participantEmail: participantEmail.trim().toLowerCase(),
        accessCode: accessCode.trim() || null,
      })

      if (res?.attemptId) {
        toast.success("Quiz started! Good luck! 🎯")
        router.push(`/quiz/${formId}/attempt/${res.attemptId}`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start quiz. Please check your details.")
    }
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
          background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 6%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 5%) 0%, transparent 70%)",
        }}
      >
        <div className="w-full max-w-md p-8 rounded-3xl border border-border/80 bg-background/95 shadow-sm text-center flex flex-col items-center gap-4">
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-md text-white animate-pulse"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Loading Quiz…</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fetching quiz details and parameters.
            </p>
          </div>
          <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  // Check if quiz is unpublished or not accepting responses
  const isClosedOrUnpublished =
    (quiz && quiz.isActive === false) ||
    (error?.message && error.message.toLowerCase().includes("not currently accepting responses"))

  // ─── Quiz Closed / Unpublished State (Interactive UI) ───────────────────────
  if (isClosedOrUnpublished) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
        style={{
          background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 8%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 6%) 0%, transparent 70%)",
        }}
      >
        <div className="w-full max-w-lg flex flex-col gap-5">
          {/* Main Card */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border shadow-md"
            style={{
              background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
              borderColor: "oklch(0.62 0.19 48 / 40%)",
            }}
          >
            {/* Ambient Glow */}
            <div
              className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-56 rounded-full blur-3xl opacity-30"
              style={{ background: "oklch(0.62 0.19 48)" }}
            />

            <div className="relative z-10 flex flex-col items-center gap-4 text-white">
              {/* Lock Icon */}
              <div
                className="flex size-16 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                <LockIcon className="size-8 text-white" />
              </div>

              {/* Status Pill */}
              <span
                className="text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1 flex items-center gap-1.5"
                style={{
                  background: "oklch(0.62 0.19 48 / 25%)",
                  color: "oklch(0.85 0.15 65)",
                  border: "1px solid oklch(0.62 0.19 48 / 45%)",
                }}
              >
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                Quiz Not Open Yet
              </span>

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {quiz?.title ?? "Quiz Not Open"}
                </h1>
                <p className="text-sm text-white/80 mt-2 leading-relaxed max-w-md mx-auto">
                  {quiz?.description
                    ? quiz.description
                    : "This quiz has been created, but responses are currently closed or have not yet been published by the organizer."}
                </p>
              </div>

              {/* Status Breakdown Box */}
              <div className="w-full mt-1 p-4 rounded-2xl bg-white/10 border border-white/15 text-left flex flex-col gap-2.5 text-xs text-white/90">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status:</span>
                  <Badge variant="outline" className="border-amber-400/50 bg-amber-400/20 text-amber-200 text-[11px] font-semibold">
                    🔒 Not Accepting Responses
                  </Badge>
                </div>
                {quiz?.questionCount !== undefined && quiz.questionCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Questions Prepared:</span>
                    <span className="font-semibold text-white">{quiz.questionCount} questions</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Expected:</span>
                  <span className="font-semibold text-white">Awaiting host to open quiz</span>
                </div>
              </div>

              {/* Interactive Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full justify-center">
                <Button
                  type="button"
                  id="check-open-now-btn"
                  onClick={handleRefreshStatus}
                  disabled={isRefreshing || isFetching}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold text-white shadow-md gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                    border: "none",
                  }}
                >
                  <RotateCcwIcon className={`size-4 ${(isRefreshing || isFetching) ? "animate-spin" : ""}`} />
                  {(isRefreshing || isFetching) ? "Checking Status…" : "Check If Open Now"}
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <Link href="/">
                    <HomeIcon className="size-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              {/* Creator Shortcut */}
              <div className="pt-3 border-t border-white/10 w-full text-center">
                <Link
                  href={`/dashboard/forms/${formId}/quiz-builder`}
                  className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4"
                >
                  Are you the quiz creator? Open Dashboard to Publish →
                </Link>
              </div>
            </div>
          </div>

          {/* Participant Note */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-center text-xs text-muted-foreground flex flex-col gap-1">
            <span className="font-semibold text-foreground">💡 Participant Tip</span>
            <span>
              If you received this link for an examination, contest, or class test, please keep this tab open and click <strong>"Check If Open Now"</strong> once your instructor instructs you to begin.
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ─── Error State (Not Found / Deleted) ───────────────────────────────────────
  if (isError || !quiz) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 6%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 5%) 0%, transparent 70%)",
        }}
      >
        <div className="w-full max-w-md p-8 rounded-3xl border border-destructive/30 bg-background text-center shadow-lg flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Quiz Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {error?.message ?? "This quiz link does not exist or has been removed by its creator."}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2 w-full justify-center">
            <Button
              variant="outline"
              onClick={() => router.refresh()}
              className="h-10 rounded-xl gap-2 font-semibold"
            >
              <RotateCcwIcon className="size-4" />
              Try Again
            </Button>
            <Button
              asChild
              className="h-10 rounded-xl gap-2 font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              <Link href="/">
                <HomeIcon className="size-4" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const timeLimit = quiz.settings?.timeLimitMinutes
    ? `${quiz.settings.timeLimitMinutes} minutes`
    : "Untimed"

  const maxAttempts = quiz.settings?.maxAttempts ?? 1
  const canStillAttempt = maxAttempts <= 0 || totalAttempts < maxAttempts
  const attemptsLeft = maxAttempts <= 0 ? null : maxAttempts - totalAttempts

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
      style={{
        background: "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 6%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 5%) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        {/* ── Quiz Banner ─────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80"
          style={{
            background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
          }}
        >
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full blur-3xl opacity-30" style={{ background: "oklch(0.62 0.19 48)" }} />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full blur-3xl opacity-20" style={{ background: "oklch(0.5 0.14 145)" }} />

          <div className="relative z-10 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
                style={{
                  background: "oklch(0.62 0.19 48 / 25%)",
                  color: "oklch(0.85 0.15 65)",
                  border: "1px solid oklch(0.62 0.19 48 / 40%)",
                }}
              >
                Interactive Quiz
              </span>

              {quiz.settings?.enableLeaderboard && (
                <button
                  type="button"
                  onClick={() => setLeaderboardOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <TrophyIcon className="size-3.5 text-amber-300" />
                  <span>Leaderboard</span>
                </button>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-sm text-white/80 mt-2 leading-relaxed">{quiz.description}</p>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <HelpCircleIcon className="size-4 shrink-0 text-[oklch(0.85_0.15_65)]" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-white/60">Questions</span>
                  <span className="text-xs font-bold">{quiz.questionCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <ClockIcon className="size-4 shrink-0 text-[oklch(0.85_0.15_65)]" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-white/60">Time</span>
                  <span className="text-xs font-bold truncate">{timeLimit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <AwardIcon className="size-4 shrink-0 text-[oklch(0.85_0.15_65)]" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-white/60">Attempts</span>
                  <span className="text-xs font-bold">{maxAttempts <= 0 ? "Unlimited" : `${maxAttempts} Max`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Previous Attempts Panel (shown when valid email entered) ─────── */}
        {debouncedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail) && (
          <div className="rounded-2xl border border-border/80 bg-background/95 overflow-hidden shadow-sm">
            <div
              className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60"
              style={{ background: "oklch(0.97 0.01 48 / 40%)" }}
            >
              <HistoryIcon className="size-4 shrink-0" style={{ color: "oklch(0.62 0.19 48)" }} />
              <span className="text-sm font-semibold text-foreground">Your Previous Attempts</span>
              {isLoadingHistory && (
                <span className="text-xs text-muted-foreground ml-auto animate-pulse">Checking…</span>
              )}
              {!isLoadingHistory && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {totalAttempts === 0 ? "No attempts yet" : `${totalAttempts} attempt${totalAttempts > 1 ? "s" : ""}`}
                </span>
              )}
            </div>

            {isLoadingHistory ? (
              <div className="p-4 flex flex-col gap-2">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : previousAttempts.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No attempts found for <strong>{debouncedEmail}</strong>.
                  {canStillAttempt ? " Start your first attempt below!" : ""}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {previousAttempts.map((attempt, idx) => {
                  const isInProgress = attempt.status === "IN_PROGRESS"
                  const isExpired   = attempt.status === "EXPIRED"
                  const isSubmitted = attempt.status === "SUBMITTED"

                  // Is an in-progress attempt still within its time window?
                  const isResumable = isInProgress && (
                    !attempt.expiresAt || new Date(attempt.expiresAt) > new Date()
                  )

                  const handleClick = () => {
                    if (isResumable) {
                      router.push(`/quiz/${formId}/attempt/${attempt.id}`)
                    } else if (isSubmitted) {
                      router.push(`/quiz/${formId}/result/${attempt.id}`)
                    }
                    // expired & non-resumable: not clickable
                  }

                  return (
                    <div
                      key={attempt.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                        isResumable || isSubmitted
                          ? "hover:bg-muted/30 cursor-pointer"
                          : "opacity-70 cursor-default"
                      }`}
                      onClick={handleClick}
                    >
                      {/* Status / attempt number badge */}
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{
                          background: isInProgress
                            ? "oklch(0.62 0.19 48)"   // saffron for in-progress
                            : isExpired
                            ? "oklch(0.5 0.0 0)"      // grey for expired
                            : attempt.passed === true
                            ? "oklch(0.5 0.14 145)"   // green for passed
                            : "oklch(0.55 0.2 25)",   // red for failed
                        }}
                      >
                        #{totalAttempts - idx}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">

                          {/* IN_PROGRESS — show Resume button */}
                          {isInProgress && (
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-bold"
                                style={{ color: "oklch(0.62 0.19 48)" }}
                              >
                                {isResumable ? "In Progress — Resume" : "In Progress — Time Expired"}
                              </span>
                              {isResumable && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 h-4 font-semibold border-0 animate-pulse"
                                  style={{ background: "oklch(0.62 0.19 48 / 20%)", color: "oklch(0.55 0.19 48)" }}
                                >
                                  <PlayIcon className="size-2.5 mr-0.5 fill-current" /> Resume
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* EXPIRED — show status */}
                          {isExpired && (
                            <span className="text-sm font-medium text-muted-foreground">
                              Attempt Expired
                            </span>
                          )}

                          {/* SUBMITTED — show score */}
                          {isSubmitted && resultsPublished && attempt.score !== null && (
                            <span className="text-sm font-bold text-foreground">
                              {attempt.score}/{attempt.totalMarks}
                              <span className="text-muted-foreground font-normal ml-1 text-xs">
                                ({attempt.percentage}%)
                              </span>
                            </span>
                          )}

                          {isSubmitted && !resultsPublished && (
                            <span className="text-sm text-muted-foreground">Results pending</span>
                          )}

                          {/* Pass/Fail badge — only for submitted */}
                          {isSubmitted && resultsPublished && attempt.passed !== null && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 h-4 font-semibold border-0"
                              style={{
                                background: attempt.passed
                                  ? "oklch(0.5 0.14 145 / 15%)"
                                  : "oklch(0.55 0.2 25 / 15%)",
                                color: attempt.passed
                                  ? "oklch(0.45 0.14 145)"
                                  : "oklch(0.55 0.2 25)",
                              }}
                            >
                              {attempt.passed ? (
                                <><CheckCircle2Icon className="size-2.5 mr-0.5" /> Passed</>
                              ) : (
                                <><XCircleIcon className="size-2.5 mr-0.5" /> Failed</>
                              )}
                            </Badge>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                          {isSubmitted && (
                            <span className="flex items-center gap-1">
                              <TimerIcon className="size-3" />
                              {formatTime(attempt.timeTaken)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            {isSubmitted
                              ? formatDate(attempt.submittedAt)
                              : formatDate(attempt.startedAt)}
                          </span>
                          {isInProgress && attempt.expiresAt && isResumable && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <ClockIcon className="size-3" />
                              Expires {formatDate(attempt.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Explicit Action Buttons */}
                      {isSubmitted && (
                        <Button
                          type="button"
                          size="sm"
                          id={`view-result-btn-${attempt.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/quiz/${formId}/result/${attempt.id}`)
                          }}
                          className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 text-white shrink-0 shadow-xs transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                          }}
                        >
                          <EyeIcon className="size-3.5" />
                          View Result
                        </Button>
                      )}

                      {isResumable && (
                        <Button
                          type="button"
                          size="sm"
                          id={`resume-attempt-btn-${attempt.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/quiz/${formId}/attempt/${attempt.id}`)
                          }}
                          className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 text-white shrink-0 shadow-xs animate-pulse transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "oklch(0.62 0.19 48)",
                          }}
                        >
                          <PlayIcon className="size-3.5 fill-current" />
                          Resume
                        </Button>
                      )}

                      {!isSubmitted && !isResumable && (
                        <ChevronRightIcon className="size-4 text-muted-foreground shrink-0 opacity-40" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}




            {/* Attempt limit warning */}
            {!canStillAttempt && (
              <div
                className="px-4 py-3 border-t border-border/60 text-sm text-center font-medium"
                style={{
                  background: "oklch(0.55 0.2 25 / 8%)",
                  color: "oklch(0.55 0.2 25)",
                }}
              >
                ⚠️ You have used all {maxAttempts} allowed attempt{maxAttempts > 1 ? "s" : ""} for this quiz.
              </div>
            )}

            {canStillAttempt && attemptsLeft !== null && totalAttempts > 0 && (
              <div
                className="px-4 py-2.5 border-t border-border/60 text-xs text-center text-muted-foreground"
                style={{ background: "oklch(0.97 0.01 48 / 20%)" }}
              >
                {attemptsLeft} attempt{attemptsLeft > 1 ? "s" : ""} remaining
              </div>
            )}
          </div>
        )}

        {/* ── Participant Entry Card ───────────────────────────────────────── */}
        <div className="rounded-3xl border border-border/80 bg-background/95 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleStartQuiz} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {totalAttempts > 0 && canStillAttempt ? "Try Again?" : "Ready to take the quiz?"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalAttempts > 0 && canStillAttempt
                  ? "Your email is prefilled. Update your name if needed and start a new attempt."
                  : "Enter your details below. Your timer starts immediately after clicking Start."}
              </p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="participant-name" className="text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <Input
                  id="participant-name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g. Jaspreet Singh"
                  required
                  autoFocus
                  disabled={isPending}
                  className="h-11 rounded-xl pl-10 text-sm border-border/80"
                />
              </div>
            </div>

            {/* Email — REQUIRED */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="participant-email" className="text-xs font-semibold">
                Email Address <span className="text-destructive">*</span>
                <span className="text-muted-foreground font-normal ml-1">(used to track your score)</span>
              </Label>
              <div className="relative">
                <MailIcon className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                <Input
                  id="participant-email"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  onBlur={() => {
                    const trimmed = participantEmail.trim().toLowerCase()
                    setDebouncedEmail(trimmed)
                    if (trimmed) {
                      try { localStorage.setItem("quiz_participant_email", trimmed) } catch {}
                    }
                  }}
                  placeholder="e.g. name@example.com"
                  required
                  disabled={isPending}
                  className="h-11 rounded-xl pl-10 text-sm border-border/80"
                />
              </div>
              {debouncedEmail && isLoadingHistory && (
                <p className="text-[11px] text-muted-foreground animate-pulse">
                  Looking up your previous attempts…
                </p>
              )}
            </div>

            {/* Access Code */}
            {quiz.settings?.accessCode && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="access-code" className="text-xs font-semibold">
                  Access Code <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LockIcon className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <Input
                    id="access-code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter quiz access passcode…"
                    required
                    disabled={isPending}
                    className="h-11 rounded-xl pl-10 text-sm font-mono tracking-wider uppercase border-border/80"
                  />
                </div>
              </div>
            )}

            {/* Actions: View Result & Start Quiz */}
            <div className="flex flex-col gap-2.5 mt-2">
              {/* If user reached attempt limit but has a submitted attempt: prominent View Result button */}
              {!canStillAttempt && latestSubmittedAttempt && (
                <Button
                  type="button"
                  id="view-result-btn"
                  onClick={() => router.push(`/quiz/${formId}/result/${latestSubmittedAttempt.id}`)}
                  className="h-12 w-full rounded-xl font-bold text-white shadow-md gap-2 text-base transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                    border: "none",
                  }}
                >
                  <EyeIcon className="size-5" />
                  View Your Result
                </Button>
              )}

              {/* Start Quiz button — only active if canStillAttempt */}
              {canStillAttempt && (
                <Button
                  type="submit"
                  disabled={isPending || !participantName.trim() || !participantEmail.trim()}
                  className="h-12 rounded-xl font-bold text-white shadow-md gap-2 text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                    border: "none",
                  }}
                >
                  <PlayIcon className="size-5 fill-current" />
                  {isPending
                    ? "Starting Quiz…"
                    : totalAttempts > 0
                    ? "Start New Attempt"
                    : "Start Quiz Now"}
                </Button>
              )}

              {/* If user can still attempt, but already has previous submitted result: secondary View Result button */}
              {canStillAttempt && latestSubmittedAttempt && (
                <Button
                  type="button"
                  variant="outline"
                  id="view-previous-result-btn"
                  onClick={() => router.push(`/quiz/${formId}/result/${latestSubmittedAttempt.id}`)}
                  className="h-11 rounded-xl font-semibold gap-2 text-sm border-border/80 hover:bg-muted/30"
                >
                  <EyeIcon className="size-4 text-muted-foreground" />
                  View Your Result
                </Button>
              )}

              {!canStillAttempt && !latestSubmittedAttempt && (
                <Button
                  type="submit"
                  disabled
                  className="h-12 rounded-xl font-bold text-white shadow-md gap-2 text-base opacity-60 cursor-not-allowed"
                >
                  Attempt Limit Reached
                </Button>
              )}
            </div>

            {!canStillAttempt && (
              <p className="text-center text-xs text-muted-foreground">
                You have used all {maxAttempts} allowed attempt{maxAttempts > 1 ? "s" : ""}.
                {latestSubmittedAttempt ? " You can view your detailed score and answers above." : " Contact the quiz creator for more attempts."}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Leaderboard Dialog */}
      <Leaderboard
        formId={formId}
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
      />
    </div>
  )
}
