"use client"

import { useState } from "react"
import {
  PlusIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckCircle2Icon,
  Trash2Icon,
  SearchIcon,
  ArrowUpDownIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { QuestionEditor, type QuestionType } from "./question-editor"
import {
  useReorderQuestions,
  useListBankItems,
  useAddBankItemToQuiz,
} from "~/hooks/api/quiz"

interface QuestionListProps {
  formId: string
  questions: any[]
  onQuestionsChanged: () => void
}

export function QuestionList({
  formId,
  questions,
  onQuestionsChanged,
}: QuestionListProps) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>("MCQ")
  const [bankModalOpen, setBankModalOpen] = useState(false)
  const [bankSearch, setBankSearch] = useState("")
  const [selectedBankItemIds, setSelectedBankItemIds] = useState<Set<string>>(new Set())

  const { reorderQuestionsAsync, isPending: isReordering } = useReorderQuestions()
  const { items: bankItems, isLoading: isBankLoading } = useListBankItems({
    search: bankSearch.trim() || null,
    limit: 50,
  })
  const { addBankItemToQuizAsync, isPending: isImporting } = useAddBankItemToQuiz()

  // Bulk import from bank
  const handleBulkImport = async () => {
    if (selectedBankItemIds.size === 0) return
    const ids = Array.from(selectedBankItemIds)
    let count = 0
    for (const id of ids) {
      try {
        await addBankItemToQuizAsync({ bankItemId: id, formId })
        count++
      } catch {}
    }
    toast.success(`Imported ${count} question(s) from bank!`)
    setSelectedBankItemIds(new Set())
    setBankModalOpen(false)
    onQuestionsChanged()
  }

  // Move question up or down
  const handleMove = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= questions.length) return

    const newQuestionList = [...questions]
    const [moved] = newQuestionList.splice(currentIndex, 1)
    if (!moved) return
    newQuestionList.splice(targetIndex, 0, moved)

    const questionIds = newQuestionList.map((q) => q.id)
    try {
      await reorderQuestionsAsync({ formId, questionIds })
      toast.success("Questions reordered")
      onQuestionsChanged()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reorder questions")
    }
  }

  // Import question from bank
  const handleImportBankItem = async (bankItemId: string) => {
    try {
      await addBankItemToQuizAsync({
        bankItemId,
        formId,
      })
      toast.success("Question imported from bank!")
      onQuestionsChanged()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to import question")
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MCQ":
        return "Single Choice"
      case "MULTIPLE_SELECT":
        return "Multiple Choice"
      case "TRUE_FALSE":
        return "True / False"
      case "SHORT_ANSWER":
        return "Short Answer"
      case "FILL_BLANK":
        return "Fill Blank"
      default:
        return type
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-emerald-700 bg-emerald-50 border-emerald-200"
      case "HARD":
        return "text-rose-700 bg-rose-50 border-rose-200"
      default:
        return "text-amber-700 bg-amber-50 border-amber-200"
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Questions ({questions.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Add, reorder, and configure question prompts and correct answers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBankModalOpen(true)}
            className="rounded-xl shadow-xs gap-1.5"
          >
            <BookOpenIcon className="size-4 text-[oklch(0.62_0.19_48)]" />
            Import from Bank
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setIsAddingNew(true)
              setEditingQuestionId(null)
            }}
            className="rounded-xl font-semibold text-white shadow-xs gap-1.5"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <PlusIcon className="size-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* New Question Form */}
      {isAddingNew && (
        <QuestionEditor
          formId={formId}
          isNew={true}
          questionIndex={questions.length}
          onSaved={() => {
            setIsAddingNew(false)
            onQuestionsChanged()
          }}
          onCancelNew={() => setIsAddingNew(false)}
        />
      )}

      {/* Empty State */}
      {questions.length === 0 && !isAddingNew ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-12 text-center"
          style={{
            borderColor: "oklch(0.62 0.19 48 / 30%)",
            background: "linear-gradient(135deg, oklch(0.62 0.19 48 / 3%), oklch(0.5 0.14 145 / 3%))",
          }}
        >
          <div
            className="flex size-14 items-center justify-center rounded-2xl shadow-sm"
            style={{
              background: "oklch(0.62 0.19 48 / 15%)",
              color: "oklch(0.62 0.19 48)",
            }}
          >
            <HelpCircleIcon className="size-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">No questions added yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Your quiz needs questions before takers can attempt it. Create your first question or import from the question bank.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button
              onClick={() => setIsAddingNew(true)}
              className="rounded-xl font-semibold text-white shadow-md gap-1.5"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
              }}
            >
              <PlusIcon className="size-4" />
              Create First Question
            </Button>
            <Button
              variant="outline"
              onClick={() => setBankModalOpen(true)}
              className="rounded-xl gap-1.5"
            >
              <BookOpenIcon className="size-4" />
              Import from Bank
            </Button>
          </div>
        </div>
      ) : (
        /* Questions List */
        <div className="flex flex-col gap-3">
          {questions.map((q, idx) => {
            const isEditing = editingQuestionId === q.id
            if (isEditing) {
              return (
                <QuestionEditor
                  key={q.id}
                  formId={formId}
                  initialData={q}
                  questionIndex={idx}
                  onSaved={() => {
                    setEditingQuestionId(null)
                    onQuestionsChanged()
                  }}
                  onCancelNew={() => setEditingQuestionId(null)}
                  onDeleted={() => {
                    setEditingQuestionId(null)
                    onQuestionsChanged()
                  }}
                />
              )
            }

            return (
              <div
                key={q.id}
                className="group flex flex-col gap-3 p-4 rounded-2xl border border-border/80 bg-background/90 hover:border-border hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Reorder and Question Preview */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Index Badge */}
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      {/* Meta badges */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge variant="outline" className="rounded-md font-semibold text-[11px]">
                          {getTypeLabel(q.questionType)}
                        </Badge>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getDifficultyColor(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {q.marks} {q.marks === 1 ? "mark" : "marks"}
                        </span>
                        {q.negativeMarks > 0 && (
                          <span className="text-[11px] font-semibold text-rose-600">
                            -{q.negativeMarks} wrong
                          </span>
                        )}
                        {q.category && (
                          <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                            {q.category}
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="font-semibold text-sm text-foreground break-words line-clamp-2 mt-0.5">
                        {q.question}
                      </p>

                      {/* Options preview for MCQ/Multi */}
                      {q.options && q.options.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          {q.options.map((opt: any, optIdx: number) => (
                            <span
                              key={opt.id ?? optIdx}
                              className={`text-xs px-2 py-0.5 rounded-md border ${
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
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button
                        type="button"
                        disabled={idx === 0 || isReordering}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ChevronUpIcon className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === questions.length - 1 || isReordering}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <ChevronDownIcon className="size-3.5" />
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestionId(q.id)}
                      className="rounded-xl text-xs h-8"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Import from Bank Dialog */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpenIcon className="size-5 text-[oklch(0.62_0.19_48)]" />
              Import from Question Bank
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select questions from your library to add directly to this quiz.
            </DialogDescription>
          </DialogHeader>

          {/* Search input & bulk action bar */}
          <div className="flex items-center gap-2 my-2">
            <div className="relative flex-1">
              <SearchIcon className="size-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search by keyword, topic, or category..."
                className="rounded-xl pl-9 h-10"
              />
            </div>
            {selectedBankItemIds.size > 0 && (
              <Button
                size="sm"
                onClick={handleBulkImport}
                disabled={isImporting}
                className="rounded-xl font-semibold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                }}
              >
                Import Selected ({selectedBankItemIds.size})
              </Button>
            )}
          </div>

          {/* Select all bar */}
          {bankItems.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedBankItemIds.size === bankItems.length) {
                    setSelectedBankItemIds(new Set())
                  } else {
                    setSelectedBankItemIds(new Set(bankItems.map((i: any) => i.id)))
                  }
                }}
                className="hover:underline font-semibold text-[oklch(0.62_0.19_48)]"
              >
                {selectedBankItemIds.size === bankItems.length ? "Deselect All" : "Select All"}
              </button>
              <span>{bankItems.length} items available</span>
            </div>
          )}

          {/* Bank Items List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 max-h-[400px]">
            {isBankLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading question bank...
              </div>
            ) : bankItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No question bank items found matching your search.
              </div>
            ) : (
              bankItems.map((item: any) => {
                const isSelected = selectedBankItemIds.has(item.id)

                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-[oklch(0.62_0.19_48)] bg-[oklch(0.62_0.19_48)/6%]"
                        : "border-border/80 bg-background/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedBankItemIds((prev) => {
                            const next = new Set(prev)
                            if (next.has(item.id)) next.delete(item.id)
                            else next.add(item.id)
                            return next
                          })
                        }}
                        className="size-4 mt-1 rounded border-border accent-[oklch(0.62_0.19_48)] cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {getTypeLabel(item.questionType)}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {item.marks} marks
                          </span>
                          {item.category && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground line-clamp-2">
                          {item.question}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleImportBankItem(item.id)}
                      disabled={isImporting}
                      className="rounded-xl shrink-0 text-white font-semibold text-xs"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
