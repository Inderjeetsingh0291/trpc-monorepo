"use client"

import { Input } from "~/components/ui/input"

interface QuestionFillBlankProps {
  value?: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

export function QuestionFillBlank({
  value = "",
  onChange,
  disabled = false,
}: QuestionFillBlankProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/60">
        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
          Your Answer:
        </span>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Fill in the blank..."
          maxLength={150}
          className="h-10 rounded-lg text-base border-border bg-background focus:border-[oklch(0.62_0.19_48)]"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Type the exact missing word or phrase.</span>
        <span>{(value ?? "").length}/150</span>
      </div>
    </div>
  )
}
