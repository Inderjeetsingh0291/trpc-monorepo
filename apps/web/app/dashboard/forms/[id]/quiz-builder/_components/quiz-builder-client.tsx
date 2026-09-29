"use client"

import { useState } from "react"
import {
  HelpCircleIcon,
  AwardIcon,
  ClockIcon,
  TrophyIcon,
  Settings2Icon,
  ListOrderedIcon,
  SparklesIcon,
} from "lucide-react"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { QuizHeader } from "~/components/quiz-builder/quiz-header"
import { QuestionList } from "~/components/quiz-builder/question-list"
import { QuizSettingsPanel } from "~/components/quiz-builder/quiz-settings-panel"
import { Skeleton } from "~/components/ui/skeleton"
import { useGetQuizById } from "~/hooks/api/quiz"

interface QuizBuilderClientProps {
  formId: string
}

export function QuizBuilderClient({ formId }: QuizBuilderClientProps) {
  const { quiz, isLoading, isError, error, refetch } = useGetQuizById(formId)
  const [activeTab, setActiveTab] = useState<"questions" | "settings">("questions")

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 gap-3">
        <h2 className="text-xl font-bold text-destructive">Quiz Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error?.message ?? "This item could not be loaded as a quiz. It may be a standard form rather than an interactive quiz."}
        </p>
        <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/dashboard/forms/${formId}`}>
              Try Opening in Form Builder
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl font-semibold text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <Link href="/dashboard/quizzes">
              Go to My Quizzes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalQuestions = quiz.questions?.length ?? 0
  const totalMarks =
    quiz.questions?.reduce((acc: number, q: any) => acc + (q.marks ?? 0), 0) ?? 0
  const timeLimit = quiz.settings?.timeLimitMinutes
    ? `${quiz.settings.timeLimitMinutes} mins`
    : "Untimed"
  const passScore = `${quiz.settings?.passingScore ?? 50}%`

  return (
    <div className="flex flex-col gap-6">
      {/* Quiz Header */}
      <QuizHeader quiz={quiz} onRefetch={refetch} />

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
          <div className="p-2 rounded-xl bg-[oklch(0.62_0.19_48)/12%] text-[oklch(0.62_0.19_48)]">
            <HelpCircleIcon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Questions</div>
            <div className="text-lg font-bold text-foreground">{totalQuestions}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
          <div className="p-2 rounded-xl bg-[oklch(0.5_0.14_145)/12%] text-[oklch(0.5_0.14_145)]">
            <AwardIcon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Marks</div>
            <div className="text-lg font-bold text-foreground">{totalMarks}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
          <div className="p-2 rounded-xl bg-[oklch(0.45_0.14_260)/12%] text-[oklch(0.45_0.14_260)]">
            <ClockIcon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Time Limit</div>
            <div className="text-lg font-bold text-foreground">{timeLimit}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
          <div className="p-2 rounded-xl bg-[oklch(0.7_0.2_60)/15%] text-[oklch(0.62_0.19_48)]">
            <TrophyIcon className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Pass Score</div>
            <div className="text-lg font-bold text-foreground">{passScore}</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "questions"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
          style={
            activeTab === "questions"
              ? { background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" }
              : undefined
          }
        >
          <ListOrderedIcon className="size-4" />
          Questions ({totalQuestions})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "settings"
              ? "text-white shadow-md"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
          style={
            activeTab === "settings"
              ? { background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))" }
              : undefined
          }
        >
          <Settings2Icon className="size-4" />
          Quiz Settings
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "questions" ? (
          <QuestionList
            formId={formId}
            questions={quiz.questions ?? []}
            onQuestionsChanged={refetch}
          />
        ) : (
          <QuizSettingsPanel
            formId={formId}
            settings={quiz.settings}
            onSettingsUpdated={refetch}
          />
        )}
      </div>
    </div>
  )
}
