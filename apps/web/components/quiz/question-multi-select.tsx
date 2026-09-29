"use client"

import { CheckIcon } from "lucide-react"

interface QuestionMultiSelectProps {
  options: Array<{
    id: string
    optionText: string
  }>
  selectedOptionIds: string[]
  onToggle: (optionId: string) => void
  disabled?: boolean
}

export function QuestionMultiSelect({
  options,
  selectedOptionIds = [],
  onToggle,
  disabled = false,
}: QuestionMultiSelectProps) {
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Select all options that apply (multiple answers allowed):
      </p>

      {options.map((opt, idx) => {
        const isSelected = selectedOptionIds.includes(opt.id)
        const letter = letters[idx] ?? String(idx + 1)

        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt.id)}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              isSelected
                ? "border-[oklch(0.62_0.19_48)] bg-[oklch(0.62_0.19_48)/8%] shadow-xs scale-[1.005]"
                : "border-border/80 bg-background/80 hover:border-border hover:bg-muted/30"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {/* Checkbox Box Indicator */}
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-all ${
                isSelected
                  ? "bg-[oklch(0.62_0.19_48)] text-white shadow-xs"
                  : "border-2 border-border/80 bg-muted/40 text-muted-foreground"
              }`}
            >
              {isSelected ? <CheckIcon className="size-4 stroke-[3]" /> : letter}
            </div>

            {/* Option Text */}
            <span
              className={`text-sm md:text-base flex-1 break-words ${
                isSelected ? "font-semibold text-foreground" : "text-foreground/90"
              }`}
            >
              {opt.optionText}
            </span>
          </button>
        )
      })}
    </div>
  )
}
