"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  DownloadIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon,
  PercentIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  BarChart3Icon,
  PieChartIcon,
  TrendingUpIcon,
  CalendarIcon,
  SparklesIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  useGetQuizAnalytics,
  useGetQuestionAnalytics,
  useExportCSV,
  useGetQuizById,
  usePublishResults,
  useDeleteAttempt,
  useUpdateAttempt,
  useDeleteQuiz,
} from "~/hooks/api/quiz"

interface QuizAnalyticsClientProps {
  formId: string
}

export function QuizAnalyticsClient({ formId }: QuizAnalyticsClientProps) {
  const { quiz } = useGetQuizById(formId)
  const { analytics, isLoading: isAnalyticsLoading } = useGetQuizAnalytics(formId)
  const { questionAnalytics, mostMissed, isLoading: isQuestionLoading } = useGetQuestionAnalytics(formId)
  const { exportCSV } = useExportCSV()
  const { publishResultsAsync, isPending: isPublishing } = usePublishResults()

  const router = useRouter()
  const { deleteAttemptAsync, isPending: isDeletingAttempt } = useDeleteAttempt()
  const { updateAttemptAsync, isPending: isUpdatingAttempt } = useUpdateAttempt()
  const { deleteQuizAsync, isPending: isDeletingQuiz } = useDeleteQuiz()

  const [isExporting, setIsExporting] = useState(false)
  const [isTogglingPublish, setIsTogglingPublish] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all")

  // State for deleting attempt
  const [deleteAttemptTarget, setDeleteAttemptTarget] = useState<{ id: string; name: string } | null>(null)

  // State for editing attempt
  const [editAttemptTarget, setEditAttemptTarget] = useState<{
    id: string
    name: string
    email: string
    score: number
    totalMarks: number
    passed: boolean
  } | null>(null)

  // State for deleting quiz
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false)

  const isResultsPublished = analytics?.resultsPublished ?? true

  const handleDeleteAttempt = async () => {
    if (!deleteAttemptTarget) return
    try {
      await deleteAttemptAsync({ attemptId: deleteAttemptTarget.id })
      toast.success(`Submission for "${deleteAttemptTarget.name}" deleted successfully.`)
      setDeleteAttemptTarget(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete submission.")
    }
  }

  const handleSaveEditAttempt = async () => {
    if (!editAttemptTarget) return
    if (!editAttemptTarget.name.trim()) {
      toast.error("Participant name cannot be empty.")
      return
    }
    try {
      await updateAttemptAsync({
        attemptId: editAttemptTarget.id,
        participantName: editAttemptTarget.name.trim(),
        participantEmail: editAttemptTarget.email.trim() || null,
        score: Math.max(0, Math.min(editAttemptTarget.totalMarks, Number(editAttemptTarget.score))),
        passed: editAttemptTarget.passed,
      })
      toast.success("Submission updated successfully.")
      setEditAttemptTarget(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update submission.")
    }
  }

  const handleDeleteQuiz = async () => {
    try {
      await deleteQuizAsync({ formId })
      toast.success("Quiz deleted successfully.")
      setDeleteQuizOpen(false)
      router.push("/dashboard/quizzes")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete quiz.")
    }
  }

  const handleTogglePublish = async () => {
    try {
      setIsTogglingPublish(true)
      const nextState = !isResultsPublished
      await publishResultsAsync({ formId, published: nextState })
      toast.success(
        nextState
          ? "Quiz results published! Participants can now view their scores and answers."
          : "Quiz results withheld. Scores and answers are now hidden from participants."
      )
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update result publication status.")
    } finally {
      setIsTogglingPublish(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const res = await exportCSV(formId)
      if (res?.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `quiz-results-${formId}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exported ${res.count} attempt(s) to CSV!`)
      } else {
        toast.error("No attempts to export.")
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to export CSV.")
    } finally {
      setIsExporting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (isAnalyticsLoading || isQuestionLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  const totalAttempts = analytics?.totalAttempts ?? 0
  const passCount = analytics?.passCount ?? 0
  const failCount = analytics?.failCount ?? 0

  // Chart data for Pass vs Fail
  const passFailData = [
    { name: "Passed", value: passCount, color: "#16a34a" }, // emerald-600
    { name: "Failed", value: failCount, color: "#e11d48" }, // rose-600
  ].filter((item) => item.value > 0)

  // Chart data for Score Distribution
  const distributionData = (analytics?.scoreDistribution ?? []).map((item: any) => ({
    range: item.range ?? item.bucket ?? "",
    count: item.count ?? 0,
  }))

  // Chart data for Recent Attempts
  const recentTimelineData = (analytics?.recentAttempts ?? [])
    .slice()
    .reverse()
    .map((att: any, idx: number) => ({
      attempt: `#${idx + 1}`,
      percentage: att.percentage,
      score: att.score,
      timeTakenMins: Math.round((att.timeTaken / 60) * 10) / 10,
      passed: att.passed,
      date: att.submittedAt
        ? new Date(att.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `Attempt ${idx + 1}`,
    }))

  // Chart data for Question Accuracy
  const questionAccuracyData = (questionAnalytics ?? []).map((q: any, idx: number) => ({
    name: `Q${idx + 1}`,
    fullName: q.question,
    accuracy: q.accuracy,
    correct: q.correctAnswers,
    wrong: q.wrongAnswers,
  }))

  // Filter submissions for entries table
  const allSubmissions = analytics?.allAttempts ?? []
  const filteredSubmissions = allSubmissions.filter((att: any) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (att.participantName ?? "").toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (att.participantEmail ?? "").toLowerCase().includes(searchQuery.toLowerCase().trim())

    if (!matchesSearch) return false
    if (statusFilter === "passed") return att.passed === true
    if (statusFilter === "failed") return att.passed === false
    return true
  })

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-xl border-border/80 shadow-xs"
          >
            <Link href={`/dashboard/forms/${formId}/quiz-builder`}>
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Quiz Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance metrics, score distributions, and question insights for &ldquo;{quiz?.title ?? "Quiz"}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl shadow-xs gap-1.5 h-9"
          >
            <Link href={`/dashboard/forms/${formId}/quiz-builder`}>
              <PencilIcon className="size-3.5" />
              <span>Edit Quiz</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteQuizOpen(true)}
            className="rounded-xl shadow-xs gap-1.5 h-9 text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-500/10 hover:text-rose-600"
          >
            <Trash2Icon className="size-3.5" />
            <span>Delete Quiz</span>
          </Button>

          <Button
            onClick={handleExport}
            disabled={isExporting || totalAttempts === 0}
            className="rounded-xl font-semibold text-white shadow-xs gap-1.5 h-9"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
            }}
          >
            <DownloadIcon className="size-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Result Publication Status Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border transition-all ${
          isResultsPublished
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
            : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              isResultsPublished
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {isResultsPublished ? (
              <EyeIcon className="size-5.5" />
            ) : (
              <EyeOffIcon className="size-5.5" />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground">
                {isResultsPublished
                  ? "Quiz Results are Published"
                  : "Quiz Results are Withheld"}
              </span>
              <Badge
                variant="outline"
                className={`text-[11px] font-bold ${
                  isResultsPublished
                    ? "border-emerald-600/40 bg-emerald-600/15 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-600/40 bg-amber-600/15 text-amber-800 dark:text-amber-200"
                }`}
              >
                {isResultsPublished ? "Publicly Visible" : "Held from Participants"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isResultsPublished
                ? "Participants can view their score, question review, and rankings upon completion."
                : "Scores and question reviews are currently hidden from participants after submission. All data is stored and visible below."}
            </p>
          </div>
        </div>

        <Button
          onClick={handleTogglePublish}
          disabled={isTogglingPublish || isPublishing}
          className={`rounded-xl font-semibold gap-2 shrink-0 shadow-xs ${
            isResultsPublished
              ? "bg-muted text-foreground border border-border hover:bg-muted/80 text-xs"
              : "text-white"
          }`}
          style={
            !isResultsPublished
              ? {
                  background:
                    "linear-gradient(135deg, oklch(0.5 0.14 145), oklch(0.6 0.14 160))",
                }
              : undefined
          }
          variant={isResultsPublished ? "outline" : "default"}
        >
          {isResultsPublished ? (
            <>
              <EyeOffIcon className="size-4" />
              {isTogglingPublish ? "Withholding..." : "Unpublish Results"}
            </>
          ) : (
            <>
              <SparklesIcon className="size-4" />
              {isTogglingPublish ? "Publishing..." : "Publish Results Now"}
            </>
          )}
        </Button>
      </div>

      {totalAttempts === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-border text-center bg-muted/20">
          <BarChart3Icon className="size-12 text-muted-foreground/40 mb-3" />
          <h2 className="text-lg font-bold text-foreground">No attempts yet</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Once participants start taking this quiz, detailed score distributions, pass/fail trends, and question accuracy charts will appear here.
          </p>
          <Button asChild className="mt-4 rounded-xl" variant="outline">
            <Link href={`/dashboard/forms/${formId}/quiz-builder`}>Return to Builder</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <UsersIcon className="size-4 text-[oklch(0.62_0.19_48)]" />
                Attempts
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">{totalAttempts}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <PercentIcon className="size-4 text-[oklch(0.5_0.14_145)]" />
                Avg Score
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {analytics?.avgPercentage ?? 0}%
              </div>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-emerald-600" />
                Pass Rate
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {analytics?.passRate ?? 0}%
              </div>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <TrophyIcon className="size-4 text-amber-500" />
                Highest
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {analytics?.highestScore ?? 0} pts
              </div>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-2xl border border-border/80 bg-background/80 shadow-xs col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ClockIcon className="size-4 text-blue-500" />
                Avg Time
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {formatTime(analytics?.avgTimeTaken ?? 0)}
              </div>
            </div>
          </div>

          {/* Charts Row 1: Score Distribution & Pass/Fail Ratio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Distribution Bar Chart (2 cols) */}
            <Card className="lg:col-span-2 rounded-3xl border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3Icon className="size-5 text-[oklch(0.62_0.19_48)]" />
                    <div>
                      <CardTitle className="text-base font-bold">Score Distribution</CardTitle>
                      <CardDescription className="text-xs">
                        Number of participants scoring across percentage buckets
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${val} attempts`, "Count"]}
                      />
                      <Bar dataKey="count" fill="oklch(0.62 0.19 48)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pass vs Fail Donut/Pie Chart (1 col) */}
            <Card className="rounded-3xl border-border/80 shadow-xs flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="size-5 text-[oklch(0.5_0.14_145)]" />
                  <div>
                    <CardTitle className="text-base font-bold">Pass vs Fail</CardTitle>
                    <CardDescription className="text-xs">
                      Proportion of participants meeting passing score
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passFailData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                      >
                        {passFailData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          fontSize: "12px",
                        }}
                        formatter={(val: any, name: any) => [`${val} participants`, name]}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-around w-full pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-600" />
                    <span className="font-semibold">{passCount} Passed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-600" />
                    <span className="font-semibold">{failCount} Failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Recent Attempts Timeline & Question Accuracy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attempts Timeline */}
            {recentTimelineData.length > 0 && (
              <Card className="rounded-3xl border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="size-5 text-[oklch(0.45_0.14_260)]" />
                    <div>
                      <CardTitle className="text-base font-bold">Recent Attempts Trend</CardTitle>
                      <CardDescription className="text-xs">
                        Scores (%) across the most recent submissions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={recentTimelineData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.5 0.14 145)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="oklch(0.5 0.14 145)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderRadius: "12px",
                            border: "1px solid hsl(var(--border))",
                            fontSize: "12px",
                          }}
                          formatter={(val: any) => [`${val}%`, "Score"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke="oklch(0.5 0.14 145)"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#scoreGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Accuracy Bar Chart */}
            <Card className="rounded-3xl border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3Icon className="size-5 text-[oklch(0.5_0.14_145)]" />
                  <div>
                    <CardTitle className="text-base font-bold">Accuracy by Question</CardTitle>
                    <CardDescription className="text-xs">
                      Percentage of participants answering each question correctly
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionAccuracyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          fontSize: "12px",
                        }}
                        formatter={(val: any, _: any, item: any) => [
                          `${val}% (${item.payload.correct} correct, ${item.payload.wrong} wrong)`,
                          item.payload.fullName,
                        ]}
                      />
                      <Bar dataKey="accuracy" fill="oklch(0.5 0.14 145)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Challenging / Missed Questions List */}
          {mostMissed && mostMissed.length > 0 && (
            <div className="flex flex-col gap-4 p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-5 text-amber-600" />
                <h2 className="text-base font-bold text-foreground">Most Challenging Questions</h2>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Questions with the lowest accuracy rates across all participant attempts. Consider reviewing question phrasing or explanations.
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                {mostMissed.map((q: any) => (
                  <div
                    key={q.questionId}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-background"
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <span className="text-sm font-semibold text-foreground line-clamp-1">
                        {q.question}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {q.questionType}
                        </Badge>
                        <span>{q.totalAnswers} total answers</span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">{q.wrongAnswers} incorrect</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <Badge
                        variant="outline"
                        className="border-rose-500/30 bg-rose-500/10 text-rose-600 font-bold px-2.5 py-1"
                      >
                        {q.accuracy}% accuracy
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Participant Submissions / Entries Table */}
          <Card className="rounded-3xl border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[oklch(0.62_0.19_48)/12%] text-[oklch(0.62_0.19_48)]">
                    <UsersIcon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">All Participant Submissions</CardTitle>
                    <CardDescription className="text-xs">
                      All saved entries, scores, and completion statuses recorded for this quiz ({allSubmissions.length} total)
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        statusFilter === "all"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({allSubmissions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("passed")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        statusFilter === "passed"
                          ? "bg-emerald-500/15 text-emerald-600 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Passed ({passCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("failed")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        statusFilter === "failed"
                          ? "bg-rose-500/15 text-rose-600 font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Failed ({failCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-48 sm:w-60">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {filteredSubmissions.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2 text-muted-foreground">
                  <UsersIcon className="size-8 opacity-40" />
                  <p className="text-sm font-semibold">No submissions found</p>
                  <p className="text-xs">
                    {searchQuery ? "No entries match your search criteria." : "No participants have submitted yet."}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Participant</TableHead>
                        <TableHead className="text-xs font-semibold">Status</TableHead>
                        <TableHead className="text-xs font-semibold">Score</TableHead>
                        <TableHead className="text-xs font-semibold">Percentage</TableHead>
                        <TableHead className="text-xs font-semibold">Time Taken</TableHead>
                        <TableHead className="text-xs font-semibold">Submitted At</TableHead>
                        <TableHead className="text-xs font-semibold text-right pr-4 min-w-[200px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((att: any) => {
                        const isPassed = att.passed === true
                        const initial = (att.participantName || "P")[0].toUpperCase()

                        return (
                          <TableRow key={att.id} className="hover:bg-muted/30">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex size-7 items-center justify-center rounded-lg text-xs font-bold bg-[oklch(0.62_0.19_48)/15%] text-[oklch(0.62_0.19_48)]">
                                  {initial}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-xs text-foreground">
                                    {att.participantName || "Anonymous Participant"}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {att.participantEmail || "Guest (no email)"}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold ${
                                  att.status === "SUBMITTED"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                    : "border-muted bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                {att.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-3 font-semibold text-xs text-foreground">
                              {att.score} / {att.totalMarks} pts
                            </TableCell>

                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className={`text-xs font-bold ${
                                  isPassed
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                    : "border-rose-500/30 bg-rose-500/10 text-rose-600"
                                }`}
                              >
                                {att.percentage}% {isPassed ? "Pass" : "Fail"}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                              {formatTime(att.timeTaken ?? 0)}
                            </TableCell>

                            <TableCell className="py-3 text-xs text-muted-foreground">
                              {att.submittedAt
                                ? new Date(att.submittedAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "In Progress"}
                            </TableCell>

                            <TableCell className="py-3 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-7 px-2 text-xs rounded-lg gap-1 hover:text-[oklch(0.62_0.19_48)]"
                                  title="View Result"
                                >
                                  <Link
                                    href={`/quiz/${formId}/result/${att.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <span>View</span>
                                    <ExternalLinkIcon className="size-3" />
                                  </Link>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditAttemptTarget({
                                      id: att.id,
                                      name: att.participantName || "",
                                      email: att.participantEmail || "",
                                      score: att.score ?? 0,
                                      totalMarks: att.totalMarks ?? 0,
                                      passed: att.passed === true,
                                    })
                                  }
                                  className="h-7 px-2 text-xs rounded-lg gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  title="Edit Submission"
                                >
                                  <PencilIcon className="size-3" />
                                  <span>Edit</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteAttemptTarget({
                                      id: att.id,
                                      name: att.participantName || "Anonymous Participant",
                                    })
                                  }
                                  className="h-7 px-2 text-xs rounded-lg gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                                  title="Delete Submission"
                                >
                                  <Trash2Icon className="size-3" />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Submission Dialog */}
          <Dialog
            open={!!editAttemptTarget}
            onOpenChange={(open) => {
              if (!open && !isUpdatingAttempt) setEditAttemptTarget(null)
            }}
          >
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <PencilIcon className="size-4 text-[oklch(0.62_0.19_48)]" />
                  Edit Participant Submission
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update participant name, email, adjust awarded score, or modify pass/fail outcome.
                </DialogDescription>
              </DialogHeader>

              {editAttemptTarget && (() => {
                const currentScore = Number(editAttemptTarget.score) || 0
                const total = editAttemptTarget.totalMarks || 1
                const percentage = Math.min(100, Math.round((currentScore / total) * 100))

                return (
                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Participant Name</Label>
                      <Input
                        value={editAttemptTarget.name}
                        onChange={(e) =>
                          setEditAttemptTarget({ ...editAttemptTarget, name: e.target.value })
                        }
                        placeholder="Participant name..."
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold">Participant Email (Optional)</Label>
                      <Input
                        type="email"
                        value={editAttemptTarget.email}
                        onChange={(e) =>
                          setEditAttemptTarget({ ...editAttemptTarget, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">Score (pts)</Label>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Max: {editAttemptTarget.totalMarks}
                          </span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={editAttemptTarget.totalMarks}
                          value={editAttemptTarget.score}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(editAttemptTarget.totalMarks, Number(e.target.value) || 0))
                            setEditAttemptTarget({ ...editAttemptTarget, score: val })
                          }}
                          className="h-9 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold">Calculated</Label>
                        <div className="h-9 flex items-center px-3 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold text-foreground">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold">Result Status</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditAttemptTarget({ ...editAttemptTarget, passed: true })}
                          className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            editAttemptTarget.passed
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 shadow-xs"
                              : "border-border/70 bg-background text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <CheckCircle2Icon className="size-3.5" />
                          Passed
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAttemptTarget({ ...editAttemptTarget, passed: false })}
                          className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            !editAttemptTarget.passed
                              ? "border-rose-500 bg-rose-500/15 text-rose-600 shadow-xs"
                              : "border-border/70 bg-background text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <XCircleIcon className="size-3.5" />
                          Failed
                        </button>
                      </div>
                    </div>

                    <DialogFooter className="mt-3 flex items-center gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUpdatingAttempt}
                        onClick={() => setEditAttemptTarget(null)}
                        className="rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUpdatingAttempt}
                        onClick={handleSaveEditAttempt}
                        className="rounded-xl text-xs font-semibold text-white"
                        style={{
                          background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
                        }}
                      >
                        {isUpdatingAttempt ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </div>
                )
              })()}
            </DialogContent>
          </Dialog>

          {/* Delete Submission Dialog */}
          <Dialog
            open={!!deleteAttemptTarget}
            onOpenChange={(open) => {
              if (!open && !isDeletingAttempt) setDeleteAttemptTarget(null)
            }}
          >
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                  <Trash2Icon className="size-4" />
                  Delete Participant Submission
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete the submission for{" "}
                  <strong className="text-foreground">{deleteAttemptTarget?.name}</strong>?
                  This will remove all associated scores, answers, and recalculate quiz analytics. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-3 flex items-center gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDeletingAttempt}
                  onClick={() => setDeleteAttemptTarget(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingAttempt}
                  onClick={handleDeleteAttempt}
                  className="rounded-xl text-xs font-semibold"
                >
                  {isDeletingAttempt ? "Deleting..." : "Delete Submission"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Quiz Dialog */}
          <Dialog
            open={deleteQuizOpen}
            onOpenChange={(open) => {
              if (!open && !isDeletingQuiz) setDeleteQuizOpen(false)
            }}
          >
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                  <AlertTriangleIcon className="size-4" />
                  Delete Entire Quiz
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete &ldquo;<strong className="text-foreground">{quiz?.title ?? "this quiz"}</strong>&rdquo;?
                  This will permanently delete the quiz, all questions, options, settings, and all participant submissions. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-3 flex items-center gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDeletingQuiz}
                  onClick={() => setDeleteQuizOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingQuiz}
                  onClick={handleDeleteQuiz}
                  className="rounded-xl text-xs font-semibold"
                >
                  {isDeletingQuiz ? "Deleting Quiz..." : "Delete Quiz"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

