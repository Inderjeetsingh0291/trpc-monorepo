"use client"

import { TrophyIcon, MedalIcon, ClockIcon, AwardIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Skeleton } from "~/components/ui/skeleton"
import { useGetLeaderboard } from "~/hooks/api/quiz"

interface LeaderboardProps {
  formId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Leaderboard({ formId, open, onOpenChange }: LeaderboardProps) {
  const { leaderboard, total, resultsPublished, isLoading, isError } = useGetLeaderboard(formId, 50, 0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex size-10 items-center justify-center rounded-xl shadow-xs"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              <TrophyIcon className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Quiz Leaderboard</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Top participants ranked by highest score and fastest completion time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-2 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-sm text-destructive">
              Leaderboard is disabled or unavailable for this quiz.
            </div>
          ) : resultsPublished === false ? (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <ClockIcon className="size-10 text-amber-500/80" />
              <p className="text-sm font-semibold text-foreground">Results are Pending</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                The organizer has withheld quiz results. The leaderboard rankings will appear once results are published.
              </p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <AwardIcon className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No entries yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to complete this quiz and claim the #1 spot!
              </p>
            </div>
          ) : (
            leaderboard.map((entry: any, index: number) => {
              const rank = index + 1
              const isTop1 = rank === 1
              const isTop2 = rank === 2
              const isTop3 = rank === 3

              return (
                <div
                  key={entry.attemptId ?? index}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isTop1
                      ? "border-amber-400/80 bg-amber-500/10 shadow-xs"
                      : isTop2
                      ? "border-slate-300 bg-slate-100/60 dark:bg-slate-800/40"
                      : isTop3
                      ? "border-amber-700/40 bg-amber-700/10"
                      : "border-border/60 bg-background/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Indicator */}
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
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
                      <span className="font-semibold text-sm text-foreground">
                        {entry.participantName}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {formatTime(entry.timeTaken)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {entry.score} pts
                    </span>
                    <span className="text-[11px] font-semibold text-[oklch(0.5_0.14_145)]">
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
