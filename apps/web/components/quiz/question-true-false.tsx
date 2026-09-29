"use client"

import { CheckIcon, XIcon } from "lucide-react"

interface QuestionTrueFalseProps {
  options: Array<{
    id: string
    optionText: string
  }>
  selectedOptionId?: string | null
  onSelect: (optionId: string) => void
  disabled?: boolean
}

export function QuestionTrueFalse({
  options,
  selectedOptionId,
  onSelect,
  disabled = false,
}: QuestionTrueFalseProps) {
  // Ensure we identify True and False options
  const trueOption = options.find((o) => o.optionText.trim().toLowerCase() === "true") ?? options[0]
  const falseOption = options.find((o) => o.optionText.trim().toLowerCase() === "false") ?? options[1]

  const items = [
    { opt: trueOption, isTrue: true, label: "True" },
    { opt: falseOption, isTrue: false, label: "False" },
  ].filter((item): item is { opt: { id: string; optionText: string }; isTrue: boolean; label: string } => !!item.opt)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(({ opt, isTrue, label }) => {
        const isSelected = selectedOptionId === opt.id

        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.id)}
            className={`flex items-center justify-center gap-3 p-6 rounded-2xl border text-center transition-all cursor-pointer ${
              isSelected
                ? isTrue
                  ? "border-[oklch(0.5_0.14_145)] bg-[oklch(0.5_0.14_145)/10%] shadow-md scale-[1.02]"
                  : "border-rose-500 bg-rose-500/10 shadow-md scale-[1.02]"
                : "border-border/80 bg-background/80 hover:border-border hover:bg-muted/30"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold transition-all ${
                isSelected
                  ? isTrue
                    ? "bg-[oklch(0.5_0.14_145)] text-white shadow-xs"
                    : "bg-rose-500 text-white shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isTrue ? (
                <CheckIcon className="size-5 stroke-[2.5]" />
              ) : (
                <XIcon className="size-5 stroke-[2.5]" />
              )}
            </div>

            <span
              className={`text-lg font-bold ${
                isSelected
                  ? isTrue
                    ? "text-[oklch(0.5_0.14_145)]"
                    : "text-rose-600"
                  : "text-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
