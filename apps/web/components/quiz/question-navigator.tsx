"use client"

import { CheckIcon, BookmarkIcon } from "lucide-react"

interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  answeredIndices: number[]
  flaggedIndices: number[]
  onSelectQuestion: (index: number) => void
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredIndices = [],
  flaggedIndices = [],
  onSelectQuestion,
}: QuestionNavigatorProps) {
  const answeredCount = answeredIndices.length
  const flaggedCount = flaggedIndices.length
  const unansweredCount = totalQuestions - answeredCount

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border/80 bg-background/90 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground">Question Navigator</h3>
        <span className="text-xs font-mono font-bold text-muted-foreground">
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = currentIndex === idx
          const isAnswered = answeredIndices.includes(idx)
          const isFlagged = flaggedIndices.includes(idx)

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`relative flex size-10 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCurrent
                  ? "ring-2 ring-[oklch(0.62_0.19_48)] ring-offset-2 ring-offset-background scale-105 z-10"
                  : ""
              } ${
                isAnswered
                  ? "bg-[oklch(0.5_0.14_145)] text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
              }`}
            >
              {idx + 1}

              {/* Flagged icon in top-right corner */}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                  <BookmarkIcon className="size-2 fill-current" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-md bg-[oklch(0.5_0.14_145)]" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-md bg-muted/60 border border-border/60" />
          <span>Unanswered ({unansweredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-md bg-amber-500" />
          <span>Flagged for Review ({flaggedCount})</span>
        </div>
      </div>
    </div>
  )
}
