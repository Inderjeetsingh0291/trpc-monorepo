"use client"

import { useState } from "react"
import Link from "next/link"
import {
  TrophyIcon,
  ClockIcon,
  AwardIcon,
  PlayIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { useGetLeaderboard, useGetQuizPublic } from "~/hooks/api/quiz"

interface QuizLeaderboardPageClientProps {
  formId: string
}

export function QuizLeaderboardPageClient({ formId }: QuizLeaderboardPageClientProps) {
  const { quiz } = useGetQuizPublic(formId)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const limit = 20

  const { leaderboard, total, resultsPublished, isLoading, isError, error } = useGetLeaderboard(
    formId,
    limit,
    page * limit
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Filter client-side by search query if typed
  const filteredLeaderboard = search.trim()
    ? leaderboard.filter((entry: any) =>
        entry.participantName.toLowerCase().includes(search.toLowerCase().trim())
      )
    : leaderboard

  const totalPages = Math.ceil(total / limit)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8"
      style={{
        background:
          "radial-gradient(ellipse at top, oklch(0.62 0.19 48 / 6%) 0%, transparent 70%), radial-gradient(ellipse at bottom, oklch(0.5 0.14 145 / 5%) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5 shadow-xs">
            <Link href={`/quiz/${formId}`}>
              <ArrowLeftIcon className="size-4" />
              Back to Quiz
            </Link>
          </Button>

          <Button
            size="sm"
            asChild
            className="rounded-xl font-semibold text-white shadow-xs gap-1.5"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            <Link href={`/quiz/${formId}`}>
              <PlayIcon className="size-3.5 fill-current" />
              Take Quiz
            </Link>
          </Button>
        </div>

        {/* Hero Header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center border border-border/80 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 size-48 rounded-full blur-3xl opacity-30"
            style={{ background: "oklch(0.62 0.19 48)" }}
          />

          <div className="relative z-10 flex flex-col items-center gap-2 text-white">
            <div
              className="flex size-14 items-center justify-center rounded-2xl shadow-lg mb-1"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              <TrophyIcon className="size-7 text-white" />
            </div>

            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "oklch(0.62 0.19 48 / 25%)",
                color: "oklch(0.85 0.15 65)",
                border: "1px solid oklch(0.62 0.19 48 / 40%)",
              }}
            >
              Hall of Fame
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {quiz?.title ?? "Quiz"} Leaderboard
            </h1>

            <p className="text-sm text-white/80 max-w-md">
              Top rank holders based on highest score and fastest submission time.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participant name..."
            className="rounded-xl pl-10 h-11 border-border/80 bg-background/90"
          />
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="rounded-3xl border border-border/80 bg-background/95 p-4 sm:p-6 shadow-xs flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-2.5 py-4">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              {error?.message ?? "Leaderboard is disabled for this quiz."}
            </div>
          ) : resultsPublished === false ? (
            <div className="p-12 text-center flex flex-col items-center gap-2">
              <ClockIcon className="size-10 text-amber-500/80" />
              <h3 className="font-bold text-base text-foreground">Results are Pending Release</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                The organizer has withheld quiz results. The leaderboard rankings will appear once results are published.
              </p>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-2">
              <AwardIcon className="size-10 text-muted-foreground/40" />
              <h3 className="font-bold text-base text-foreground">No participants found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {search ? "No participant matched your search." : "Be the first to complete this quiz!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredLeaderboard.map((entry: any, idx: number) => {
                const rank = page * limit + idx + 1
                const isTop1 = rank === 1
                const isTop2 = rank === 2
                const isTop3 = rank === 3

                return (
                  <div
                    key={entry.attemptId ?? idx}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isTop1
                        ? "border-amber-400/80 bg-amber-400/10 shadow-xs scale-[1.01]"
                        : isTop2
                        ? "border-slate-300 bg-slate-100/60 dark:bg-slate-800/40"
                        : isTop3
                        ? "border-amber-700/40 bg-amber-700/10"
                        : "border-border/60 bg-background/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                          isTop1
                            ? "bg-amber-400 text-amber-950 shadow-xs"
                            : isTop2
                            ? "bg-slate-300 text-slate-900"
                            : isTop3
                            ? "bg-amber-700 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rank}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">
                          {entry.participantName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {formatTime(entry.timeTaken)}
                          </span>
                          {entry.submittedAt && (
                            <>
                              <span>•</span>
                              <span>{new Date(entry.submittedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-base text-foreground">
                        {entry.score} pts
                      </span>
                      <span className="text-xs font-semibold text-[oklch(0.5_0.14_145)]">
                        {entry.percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">
                Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="rounded-lg h-8"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="font-semibold px-2">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg h-8"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
