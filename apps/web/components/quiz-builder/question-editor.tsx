"use client"

import { useState } from "react"
import {
  PlusIcon,
  Trash2Icon,
  CopyIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  SparklesIcon,
  LightbulbIcon,
  TagIcon,
  FolderIcon,
  ChevronDownIcon,
  SaveIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { OptionEditor } from "./option-editor"
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useDuplicateQuestion,
} from "~/hooks/api/quiz"

export type QuestionType = "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_BLANK"
export type DifficultyType = "EASY" | "MEDIUM" | "HARD"

export interface QuestionData {
  id?: string
  formId: string
  question: string
  questionType: QuestionType
  marks: number
  negativeMarks: number
  explanation?: string | null
  difficulty: DifficultyType
  category?: string | null
  tags?: string[] | null
  acceptedAnswers?: string[] | null
  options?: Array<{
    id?: string
    optionText: string
    isCorrect: boolean
    order: number
  }>
}

interface QuestionEditorProps {
  formId: string
  initialData?: QuestionData
  isNew?: boolean
  questionIndex: number
  onSaved?: () => void
  onCancelNew?: () => void
  onDeleted?: () => void
}

export function QuestionEditor({
  formId,
  initialData,
  isNew = false,
  questionIndex,
  onSaved,
  onCancelNew,
  onDeleted,
}: QuestionEditorProps) {
  const [question, setQuestion] = useState(initialData?.question ?? "")
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.questionType ?? "MCQ"
  )
  const [marks, setMarks] = useState(initialData?.marks ?? 1)
  const [negativeMarks, setNegativeMarks] = useState(initialData?.negativeMarks ?? 0)
  const [explanation, setExplanation] = useState(initialData?.explanation ?? "")
  const [difficulty, setDifficulty] = useState<DifficultyType>(
    initialData?.difficulty ?? "MEDIUM"
  )
  const [category, setCategory] = useState(initialData?.category ?? "")
  const [tagInput, setTagInput] = useState(initialData?.tags?.join(", ") ?? "")
  const [acceptedAnswersInput, setAcceptedAnswersInput] = useState(
    initialData?.acceptedAnswers?.join(", ") ?? ""
  )

  // Options state
  const defaultOptions = [
    { optionText: "Option 1", isCorrect: true, order: 0 },
    { optionText: "Option 2", isCorrect: false, order: 1 },
    { optionText: "Option 3", isCorrect: false, order: 2 },
    { optionText: "Option 4", isCorrect: false, order: 3 },
  ]

  const [options, setOptions] = useState<
    Array<{ id?: string; optionText: string; isCorrect: boolean; order: number }>
  >(
    initialData?.options && initialData.options.length > 0
      ? initialData.options
      : questionType === "TRUE_FALSE"
      ? [
          { optionText: "True", isCorrect: true, order: 0 },
          { optionText: "False", isCorrect: false, order: 1 },
        ]
      : defaultOptions
  )

  const [showAdvanced, setShowAdvanced] = useState(
    !!(initialData?.explanation || initialData?.category || initialData?.tags?.length)
  )

  const { createQuestionAsync, isPending: isCreating } = useCreateQuestion()
  const { updateQuestionAsync, isPending: isUpdating } = useUpdateQuestion()
  const { deleteQuestionAsync, isPending: isDeleting } = useDeleteQuestion()
  const { duplicateQuestionAsync, isPending: isDuplicating } = useDuplicateQuestion()

  const isPending = isCreating || isUpdating || isDeleting || isDuplicating

  // Handler for question type change
  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType)
    if (newType === "TRUE_FALSE") {
      setOptions([
        { optionText: "True", isCorrect: true, order: 0 },
        { optionText: "False", isCorrect: false, order: 1 },
      ])
    } else if (newType === "MCQ" || newType === "MULTIPLE_SELECT") {
      if (options.length < 2) {
        setOptions([
          { optionText: "Option 1", isCorrect: true, order: 0 },
          { optionText: "Option 2", isCorrect: false, order: 1 },
        ])
      } else if (newType === "MCQ") {
        // Ensure only 1 is marked correct
        const hasCorrect = options.some((o) => o.isCorrect)
        if (!hasCorrect) {
          setOptions(options.map((o, i) => ({ ...o, isCorrect: i === 0 })))
        } else {
          let foundFirst = false
          setOptions(
            options.map((o) => {
              if (o.isCorrect && !foundFirst) {
                foundFirst = true
                return o
              }
              return { ...o, isCorrect: false }
            })
          )
        }
      }
    }
  }

  // Toggle option correct state
  const handleToggleCorrect = (idx: number) => {
    if (questionType === "MCQ" || questionType === "TRUE_FALSE") {
      setOptions(
        options.map((opt, i) => ({
          ...opt,
          isCorrect: i === idx,
        }))
      )
    } else if (questionType === "MULTIPLE_SELECT") {
      setOptions(
        options.map((opt, i) => (i === idx ? { ...opt, isCorrect: !opt.isCorrect } : opt))
      )
    }
  }

  // Change option text
  const handleChangeOptionText = (idx: number, text: string) => {
    setOptions(options.map((opt, i) => (i === idx ? { ...opt, optionText: text } : opt)))
  }

  // Add option
  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        optionText: `Option ${options.length + 1}`,
        isCorrect: false,
        order: options.length,
      },
    ])
  }

  // Delete option
  const handleDeleteOption = (idx: number) => {
    const updated = options.filter((_, i) => i !== idx)
    // If we deleted the only correct option, mark the first one as correct
    const hasCorrect = updated.some((o) => o.isCorrect)
    if (!hasCorrect && updated.length > 0) {
      updated[0] = { ...updated[0]!, isCorrect: true }
    }
    setOptions(updated.map((opt, i) => ({ ...opt, order: i })))
  }

  // Save handler
  const handleSave = async () => {
    if (!question.trim()) {
      toast.error("Please enter question text")
      return
    }

    // Validation for options
    if (questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE") {
      if (options.length < 2) {
        toast.error("At least 2 choices are required")
        return
      }
      for (const opt of options) {
        if (!opt.optionText.trim()) {
          toast.error("Option text cannot be empty")
          return
        }
      }
      const correctCount = options.filter((o) => o.isCorrect).length
      if (correctCount === 0) {
        toast.error("Please mark at least one correct answer")
        return
      }
      if (questionType === "MCQ" && correctCount > 1) {
        toast.error("Single choice questions can only have one correct answer")
        return
      }
    }

    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const acceptedAnswersArray = acceptedAnswersInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)

    try {
      if (isNew || !initialData?.id) {
        await createQuestionAsync({
          formId,
          question: question.trim(),
          questionType,
          marks,
          negativeMarks,
          explanation: explanation.trim() || null,
          difficulty,
          category: category.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          acceptedAnswers: acceptedAnswersArray.length > 0 ? acceptedAnswersArray : null,
          options:
            questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE"
              ? options.map((opt, i) => ({
                  optionText: opt.optionText.trim(),
                  isCorrect: opt.isCorrect,
                  order: i,
                }))
              : [],
        })
        toast.success("Question created!")
      } else {
        await updateQuestionAsync({
          questionId: initialData.id,
          question: question.trim(),
          questionType,
          marks,
          negativeMarks,
          explanation: explanation.trim() || null,
          difficulty,
          category: category.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          acceptedAnswers: acceptedAnswersArray.length > 0 ? acceptedAnswersArray : null,
          options:
            questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE"
              ? options.map((opt, i) => ({
                  id: opt.id,
                  optionText: opt.optionText.trim(),
                  isCorrect: opt.isCorrect,
                  order: i,
                }))
              : [],
        })
        toast.success("Question updated!")
      }
      onSaved?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save question")
    }
  }

  // Duplicate question
  const handleDuplicate = async () => {
    if (!initialData?.id) return
    try {
      await duplicateQuestionAsync({ questionId: initialData.id })
      toast.success("Question duplicated!")
      onSaved?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to duplicate question")
    }
  }

  // Delete question
  const handleDelete = async () => {
    if (!initialData?.id) return
    try {
      await deleteQuestionAsync({ questionId: initialData.id })
      toast.success("Question deleted!")
      onDeleted?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete question")
    }
  }

  return (
    <div
      className="flex flex-col gap-5 p-5 sm:p-6 rounded-2xl border border-border/80 bg-background shadow-xs transition-all"
      style={{
        borderLeft: isNew
          ? "4px solid oklch(0.62 0.19 48)"
          : "4px solid oklch(0.5 0.14 145)",
      }}
    >
      {/* Header with question number, type selector, and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            {questionIndex + 1}
          </span>

          {/* Question Type Selection */}
          <select
            value={questionType}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="h-8 rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.62_0.19_48)]"
          >
            <option value="MCQ">Single Choice (MCQ)</option>
            <option value="MULTIPLE_SELECT">Multiple Choice (Checkboxes)</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="FILL_BLANK">Fill in the Blank</option>
          </select>

          {/* Difficulty Selection */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
            className="h-8 rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.62_0.19_48)]"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {!isNew && initialData?.id && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleDuplicate}
                disabled={isPending}
                className="rounded-lg text-muted-foreground hover:text-foreground"
                title="Duplicate question"
              >
                <CopyIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete question"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </>
          )}
          {isNew && onCancelNew && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelNew}
              className="text-xs rounded-lg"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Question Prompt Textarea */}
      <div className="flex flex-col gap-1.5">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question prompt here..."
          rows={3}
          maxLength={2000}
          className="rounded-xl resize-none text-base font-medium border-border/80 bg-background/60 focus:border-[oklch(0.62_0.19_48)]"
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Click on the letters below to set the correct answer(s)</span>
          <span>{question.length}/2000</span>
        </div>
      </div>

      {/* Options or Answer inputs */}
      {(questionType === "MCQ" ||
        questionType === "MULTIPLE_SELECT" ||
        questionType === "TRUE_FALSE") && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Answer Choices ({options.length})
            </span>
            {questionType !== "TRUE_FALSE" && options.length < 8 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-7 text-xs rounded-lg gap-1 border-dashed"
              >
                <PlusIcon className="size-3" />
                Add Choice
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <OptionEditor
                key={i}
                index={i}
                optionText={opt.optionText}
                isCorrect={opt.isCorrect}
                isMultiSelect={questionType === "MULTIPLE_SELECT"}
                canDelete={questionType !== "TRUE_FALSE" && options.length > 2}
                onChangeText={(text) => handleChangeOptionText(i, text)}
                onToggleCorrect={() => handleToggleCorrect(i)}
                onDelete={() => handleDeleteOption(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Short Answer / Fill in the blank inputs */}
      {(questionType === "SHORT_ANSWER" || questionType === "FILL_BLANK") && (
        <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <Label className="text-xs font-semibold">
            Accepted Answers (Comma separated)
          </Label>
          <Input
            value={acceptedAnswersInput}
            onChange={(e) => setAcceptedAnswersInput(e.target.value)}
            placeholder="e.g. JavaScript, JS, ECMAScript"
            className="rounded-xl h-10"
          />
          <p className="text-[11px] text-muted-foreground">
            Grading is case-insensitive. Any answer matching one of these terms will receive marks.
          </p>
        </div>
      )}

      {/* Marks, Negative Marks & Advanced Collapsible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Marks for Correct
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={marks}
            onChange={(e) => setMarks(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="h-8 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[11px] font-semibold text-muted-foreground">
            Negative Marks
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="h-8 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground justify-between"
          >
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-[oklch(0.62_0.19_48)]" />
              {showAdvanced ? "Hide Explanation & Tags" : "Add Explanation, Category & Tags"}
            </span>
            <ChevronDownIcon
              className={`size-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Advanced Drawer */}
      {showAdvanced && (
        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <LightbulbIcon className="size-3.5 text-amber-500" />
              Answer Explanation (Optional)
            </Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the answer is correct. This is shown to participants during post-test review."
              rows={2}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <FolderIcon className="size-3.5 text-blue-500" />
                Category / Subject
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Frontend Development"
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <TagIcon className="size-3.5 text-green-500" />
                Tags (Comma separated)
              </Label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="react, typescript, state"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-1">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending || !question.trim()}
          className="rounded-xl font-semibold text-white shadow-xs gap-1.5"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
          }}
        >
          <SaveIcon className="size-4" />
          {isPending ? "Saving..." : isNew ? "Add Question" : "Save Question"}
        </Button>
      </div>
    </div>
  )
}
