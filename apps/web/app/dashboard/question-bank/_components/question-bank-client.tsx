"use client"

import { useState } from "react"
import {
  BookOpenIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  Edit2Icon,
  CheckCircle2Icon,
  FilterIcon,
  FolderIcon,
  TagIcon,
  LightbulbIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  useListBankItems,
  useCreateBankItem,
  useUpdateBankItem,
  useDeleteBankItem,
} from "~/hooks/api/quiz"

type QuestionType = "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_BLANK"
type DifficultyType = "EASY" | "MEDIUM" | "HARD"

export function QuestionBankClient() {
  const [search, setSearch] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  // Editor form state
  const [question, setQuestion] = useState("")
  const [questionType, setQuestionType] = useState<QuestionType>("MCQ")
  const [marks, setMarks] = useState(1)
  const [negativeMarks, setNegativeMarks] = useState(0)
  const [explanation, setExplanation] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyType>("MEDIUM")
  const [category, setCategory] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [options, setOptions] = useState<Array<{ optionText: string; isCorrect: boolean }>>([
    { optionText: "Option 1", isCorrect: true },
    { optionText: "Option 2", isCorrect: false },
    { optionText: "Option 3", isCorrect: false },
    { optionText: "Option 4", isCorrect: false },
  ])

  const { items, total, isLoading, refetch } = useListBankItems({
    search: search.trim() || null,
    difficulty: difficultyFilter !== "ALL" ? (difficultyFilter as DifficultyType) : null,
    questionType: typeFilter !== "ALL" ? (typeFilter as QuestionType) : null,
    limit: 50,
  })

  const { createBankItemAsync, isPending: isCreating } = useCreateBankItem()
  const { updateBankItemAsync, isPending: isUpdating } = useUpdateBankItem()
  const { deleteBankItemAsync, isPending: isDeleting } = useDeleteBankItem()

  const isPending = isCreating || isUpdating || isDeleting

  const openCreateDialog = () => {
    setEditingItem(null)
    setQuestion("")
    setQuestionType("MCQ")
    setMarks(1)
    setNegativeMarks(0)
    setExplanation("")
    setDifficulty("MEDIUM")
    setCategory("")
    setTagInput("")
    setOptions([
      { optionText: "Option 1", isCorrect: true },
      { optionText: "Option 2", isCorrect: false },
      { optionText: "Option 3", isCorrect: false },
      { optionText: "Option 4", isCorrect: false },
    ])
    setIsEditorOpen(true)
  }

  const openEditDialog = (item: any) => {
    setEditingItem(item)
    setQuestion(item.question)
    setQuestionType(item.questionType)
    setMarks(item.marks)
    setNegativeMarks(item.negativeMarks ?? 0)
    setExplanation(item.explanation ?? "")
    setDifficulty(item.difficulty)
    setCategory(item.category ?? "")
    setTagInput(item.tags?.join(", ") ?? "")
    setOptions(
      item.options && item.options.length > 0
        ? item.options.map((o: any) => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
        : [
            { optionText: "Option 1", isCorrect: true },
            { optionText: "Option 2", isCorrect: false },
          ]
    )
    setIsEditorOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      toast.error("Question text is required")
      return
    }

    if (questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE") {
      if (options.length < 2) {
        toast.error("At least 2 choices required")
        return
      }
      const hasCorrect = options.some((o) => o.isCorrect)
      if (!hasCorrect) {
        toast.error("Please mark at least one correct choice")
        return
      }
    }

    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (editingItem) {
        await updateBankItemAsync({
          id: editingItem.id,
          question: question.trim(),
          questionType,
          marks,
          negativeMarks,
          explanation: explanation.trim() || null,
          difficulty,
          category: category.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          options:
            questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE"
              ? options
              : [],
        })
        toast.success("Question bank item updated")
      } else {
        await createBankItemAsync({
          question: question.trim(),
          questionType,
          marks,
          negativeMarks,
          explanation: explanation.trim() || null,
          difficulty,
          category: category.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          options:
            questionType === "MCQ" || questionType === "MULTIPLE_SELECT" || questionType === "TRUE_FALSE"
              ? options
              : [],
        })
        toast.success("Question saved to bank")
      }
      setIsEditorOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save question")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBankItemAsync({ id })
      toast.success("Question removed from bank")
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete question")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-sm border border-border/80"
        style={{
          background: "linear-gradient(135deg, oklch(0.165 0.05 30) 0%, oklch(0.22 0.06 35) 60%, oklch(0.2 0.05 145) 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 w-fit"
              style={{
                background: "oklch(0.62 0.19 48 / 25%)",
                color: "oklch(0.85 0.15 65)",
                border: "1px solid oklch(0.62 0.19 48 / 40%)",
              }}
            >
              Reusable Library
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Question Bank</h1>
            <p className="text-sm text-white/80 max-w-xl">
              Build your personal repository of questions. Tag, categorize, and reuse them across any quizzes you create.
            </p>
          </div>

          <Button
            onClick={openCreateDialog}
            className="rounded-xl font-bold text-white shadow-md gap-2 self-start sm:self-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              border: "none",
            }}
          >
            <PlusIcon className="size-4" />
            Add to Bank
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="size-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword or topic..."
            className="rounded-xl pl-10 h-11 border-border/80 bg-background/90"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-11 rounded-xl border border-border/80 bg-background/90 px-3 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-xl border border-border/80 bg-background/90 px-3 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="MCQ">Single Choice</option>
            <option value="MULTIPLE_SELECT">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="FILL_BLANK">Fill Blank</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 rounded-3xl border border-dashed border-border text-center bg-muted/20">
          <BookOpenIcon className="size-12 text-muted-foreground/40 mb-3" />
          <h2 className="text-lg font-bold text-foreground">No questions in library</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create reusable questions to quickly construct quizzes without starting from scratch.
          </p>
          <Button
            onClick={openCreateDialog}
            className="mt-4 rounded-xl font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <PlusIcon className="size-4 mr-1.5" />
            Add First Question
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-border/80 bg-background/95 hover:border-border hover:shadow-xs transition-all flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {item.questionType}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-border bg-muted/40">
                      {item.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {item.marks} marks
                    </span>
                    {item.category && (
                      <span className="text-[11px] bg-[oklch(0.62_0.19_48)/10%] text-[oklch(0.62_0.19_48)] px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {item.question}
                  </h3>

                  {item.options && item.options.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {item.options.map((opt: any, idx: number) => (
                        <span
                          key={idx}
                          className={`text-xs px-2.5 py-0.5 rounded-md border ${
                            opt.isCorrect
                              ? "border-[oklch(0.5_0.14_145)/40%] bg-[oklch(0.5_0.14_145)/10%] text-[oklch(0.5_0.14_145)] font-semibold"
                              : "border-border/60 bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {opt.isCorrect && "✓ "}
                          {opt.optionText}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditDialog(item)}
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Edit2Icon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="rounded-3xl sm:max-w-xl max-h-[85vh] flex flex-col">
          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold">
                {editingItem ? "Edit Question" : "New Bank Question"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure question details and answers for your library.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-1 py-2 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold">Question Type</Label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium"
                  >
                    <option value="MCQ">Single Choice (MCQ)</option>
                    <option value="MULTIPLE_SELECT">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="FILL_BLANK">Fill Blank</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold">Difficulty</Label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">Question Prompt</Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter question text..."
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                  required
                />
              </div>

              {/* Options */}
              {(questionType === "MCQ" ||
                questionType === "MULTIPLE_SELECT" ||
                questionType === "TRUE_FALSE") && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold">
                    Choices (Click circle to mark correct)
                  </Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (questionType === "MULTIPLE_SELECT") {
                            setOptions(
                              options.map((o, idx) =>
                                idx === i ? { ...o, isCorrect: !o.isCorrect } : o
                              )
                            )
                          } else {
                            setOptions(
                              options.map((o, idx) => ({ ...o, isCorrect: idx === i }))
                            )
                          }
                        }}
                        className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          opt.isCorrect
                            ? "bg-[oklch(0.5_0.14_145)] text-white"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {opt.isCorrect ? "✓" : i + 1}
                      </button>
                      <Input
                        value={opt.optionText}
                        onChange={(e) =>
                          setOptions(
                            options.map((o, idx) =>
                              idx === i ? { ...o, optionText: e.target.value } : o
                            )
                          )
                        }
                        placeholder={`Option ${i + 1}`}
                        className="h-9 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold">Marks</Label>
                  <Input
                    type="number"
                    min={0}
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value, 10) || 1)}
                    className="h-9 rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Science"
                    className="h-9 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold">Answer Explanation (Optional)</Label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="rounded-xl text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                {isPending ? "Saving..." : editingItem ? "Update Question" : "Save to Bank"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
