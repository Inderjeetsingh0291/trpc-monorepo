"use client"

import { CheckIcon, Trash2Icon, GripVerticalIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

interface OptionEditorProps {
  index: number
  optionText: string
  isCorrect: boolean
  isMultiSelect: boolean
  canDelete: boolean
  onChangeText: (text: string) => void
  onToggleCorrect: () => void
  onDelete: () => void
}

export function OptionEditor({
  index,
  optionText,
  isCorrect,
  isMultiSelect,
  canDelete,
  onChangeText,
  onToggleCorrect,
  onDelete,
}: OptionEditorProps) {
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
  const letter = letters[index] ?? String(index + 1)

  return (
    <div
      className={`group flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
        isCorrect
          ? "border-[oklch(0.5_0.14_145)] bg-[oklch(0.5_0.14_145)/6%] shadow-xs"
          : "border-border/70 bg-background/80 hover:border-border"
      }`}
    >
      {/* Option Letter Indicator / Correct Toggle Button */}
      <button
        type="button"
        onClick={onToggleCorrect}
        title={isCorrect ? "Correct answer (click to deselect)" : "Click to mark as correct answer"}
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
          isCorrect
            ? "bg-[oklch(0.5_0.14_145)] text-white shadow-xs scale-105"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
      >
        {isCorrect ? <CheckIcon className="size-4 stroke-[3]" /> : letter}
      </button>

      {/* Option Text Input */}
      <Input
        value={optionText}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={`Option ${letter} text...`}
        maxLength={500}
        className={`h-9 border-0 bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-[oklch(0.62_0.19_48)] ${
          isCorrect ? "font-medium text-foreground" : "text-foreground/90"
        }`}
      />

      {/* Correct tag */}
      {isCorrect && (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.5_0.14_145)] px-2 py-0.5 rounded-md bg-[oklch(0.5_0.14_145)/12%]">
          Correct
        </span>
      )}

      {/* Delete Option */}
      {canDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          className="size-7 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
          title="Delete Option"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
