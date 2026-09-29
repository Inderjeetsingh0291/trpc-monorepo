"use client"

import { Input } from "~/components/ui/input"

interface QuestionShortAnswerProps {
  value?: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

export function QuestionShortAnswer({
  value = "",
  onChange,
  disabled = false,
}: QuestionShortAnswerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here..."
        maxLength={200}
        className="h-12 rounded-xl text-base px-4 border-border/80 bg-background/80 focus:border-[oklch(0.62_0.19_48)]"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Answers are not case-sensitive.</span>
        <span>{(value ?? "").length}/200</span>
      </div>
    </div>
  )
}
