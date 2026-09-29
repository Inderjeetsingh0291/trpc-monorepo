"use client"

import { useState } from "react"
import {
  ClockIcon,
  ShieldCheckIcon,
  ShuffleIcon,
  TrophyIcon,
  SparklesIcon,
  SaveIcon,
  LockIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Slider } from "~/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { useUpdateQuizSettings } from "~/hooks/api/quiz"

interface QuizSettingsPanelProps {
  formId: string
  settings?: {
    timeLimitMinutes?: number | null
    maxAttempts?: number
    passingScore?: number
    showResultImmediately?: boolean
    resultsPublished?: boolean
    resultsPublishedAt?: Date | string | null
    showCorrectAnswers?: boolean
    shuffleQuestions?: boolean
    shuffleOptions?: boolean
    enableLeaderboard?: boolean
    accessCode?: string | null
    allowGuests?: boolean
    questionsToShow?: number | null
    difficultyDistribution?: Record<string, number> | null
  } | null
  onSettingsUpdated?: () => void
}

export function QuizSettingsPanel({
  formId,
  settings,
  onSettingsUpdated,
}: QuizSettingsPanelProps) {
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>(
    settings?.timeLimitMinutes ? String(settings.timeLimitMinutes) : ""
  )
  const [isTimed, setIsTimed] = useState<boolean>(!!settings?.timeLimitMinutes)
  const [maxAttempts, setMaxAttempts] = useState<number>(settings?.maxAttempts ?? 1)
  const [passingScore, setPassingScore] = useState<number>(settings?.passingScore ?? 50)
  const [showResultImmediately, setShowResultImmediately] = useState<boolean>(
    settings?.showResultImmediately ?? true
  )
  const [resultsPublished, setResultsPublished] = useState<boolean>(
    settings?.resultsPublished ?? true
  )
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(
    settings?.showCorrectAnswers ?? true
  )
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    settings?.shuffleQuestions ?? false
  )
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(
    settings?.shuffleOptions ?? false
  )
  const [enableLeaderboard, setEnableLeaderboard] = useState<boolean>(
    settings?.enableLeaderboard ?? true
  )
  const [hasAccessCode, setHasAccessCode] = useState<boolean>(!!settings?.accessCode)
  const [accessCode, setAccessCode] = useState<string>(settings?.accessCode ?? "")
  const [allowGuests, setAllowGuests] = useState<boolean>(settings?.allowGuests ?? true)
  const [questionsToShow, setQuestionsToShow] = useState<string>(
    settings?.questionsToShow ? String(settings.questionsToShow) : ""
  )

  const initialDist = (settings as any)?.difficultyDistribution as Record<string, number> | null
  const [hasDifficultyDist, setHasDifficultyDist] = useState<boolean>(
    !!(initialDist && (initialDist.EASY || initialDist.MEDIUM || initialDist.HARD))
  )
  const [easyCount, setEasyCount] = useState<string>(
    initialDist?.EASY ? String(initialDist.EASY) : ""
  )
  const [mediumCount, setMediumCount] = useState<string>(
    initialDist?.MEDIUM ? String(initialDist.MEDIUM) : ""
  )
  const [hardCount, setHardCount] = useState<string>(
    initialDist?.HARD ? String(initialDist.HARD) : ""
  )

  const { updateSettingsAsync, isPending } = useUpdateQuizSettings()

  const handleSave = async () => {
    try {
      const difficultyDistribution = hasDifficultyDist
        ? {
            EASY: easyCount ? parseInt(easyCount, 10) : 0,
            MEDIUM: mediumCount ? parseInt(mediumCount, 10) : 0,
            HARD: hardCount ? parseInt(hardCount, 10) : 0,
          }
        : null

      await updateSettingsAsync({
        formId,
        timeLimitMinutes: isTimed && timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : null,
        maxAttempts: maxAttempts > 0 ? maxAttempts : 1,
        passingScore,
        showResultImmediately,
        resultsPublished,
        showCorrectAnswers,
        shuffleQuestions,
        shuffleOptions,
        enableLeaderboard,
        accessCode: hasAccessCode && accessCode.trim() ? accessCode.trim() : null,
        allowGuests,
        questionsToShow: questionsToShow ? parseInt(questionsToShow, 10) : null,
        difficultyDistribution,
      })
      toast.success("Quiz settings saved successfully!")
      onSettingsUpdated?.()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save settings")
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Quiz Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure time restrictions, grading criteria, randomization, and participant access.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl font-semibold text-white shadow-md gap-2"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.19 48), oklch(0.7 0.2 60))",
          }}
        >
          <SaveIcon className="size-4" />
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timing & Attempts Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.62_0.19_48)/12%] text-[oklch(0.62_0.19_48)]">
                <ClockIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Timing & Attempts</CardTitle>
                <CardDescription className="text-xs">Limit how long and how often users can take this quiz</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="timed-toggle" className="font-semibold text-sm cursor-pointer">
                  Enable Time Limit
                </Label>
                <span className="text-xs text-muted-foreground">
                  Quiz will automatically submit when time expires
                </span>
              </div>
              <Switch
                id="timed-toggle"
                checked={isTimed}
                onCheckedChange={setIsTimed}
              />
            </div>

            {isTimed && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="time-limit-input" className="text-xs font-semibold">
                  Time Limit (Minutes)
                </Label>
                <Input
                  id="time-limit-input"
                  type="number"
                  min={1}
                  max={600}
                  placeholder="e.g. 15"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-attempts" className="text-xs font-semibold">
                  Maximum Attempts
                </Label>
                <span className="text-xs font-mono font-bold text-foreground">
                  {maxAttempts} {maxAttempts === 1 ? "attempt" : "attempts"}
                </span>
              </div>
              <Input
                id="max-attempts"
                type="number"
                min={1}
                max={50}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="rounded-xl h-10"
              />
              <span className="text-[11px] text-muted-foreground">
                Set to 1 for standard exam or test conditions
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Scoring & Results Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.5_0.14_145)/12%] text-[oklch(0.5_0.14_145)]">
                <TrophyIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Scoring & Grading</CardTitle>
                <CardDescription className="text-xs">Pass requirements and what takers see upon completion</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="pass-score" className="text-xs font-semibold">
                  Passing Score Percentage
                </Label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[oklch(0.5_0.14_145)/15%] text-[oklch(0.5_0.14_145)]">
                  {passingScore}%
                </span>
              </div>
              <Slider
                id="pass-score"
                value={[passingScore]}
                onValueChange={(val) => setPassingScore(val[0] ?? 50)}
                min={0}
                max={100}
                step={5}
                className="py-1"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="publish-results-toggle" className="font-semibold text-sm cursor-pointer">
                    Publish Results to Participants
                  </Label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      resultsPublished
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                    }`}
                  >
                    {resultsPublished ? "Published" : "Withheld"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Allow participants to view their results and rankings. Turn off to withhold results until manually published.
                </span>
              </div>
              <Switch
                id="publish-results-toggle"
                checked={resultsPublished}
                onCheckedChange={setResultsPublished}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="immediate-results" className="font-semibold text-sm cursor-pointer">
                  Show Score Immediately
                </Label>
                <span className="text-xs text-muted-foreground">
                  Display total score and pass/fail status immediately after submission
                </span>
              </div>
              <Switch
                id="immediate-results"
                checked={showResultImmediately}
                onCheckedChange={(val) => {
                  setShowResultImmediately(val)
                  if (!val) {
                    setResultsPublished(false)
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="show-answers" className="font-semibold text-sm cursor-pointer">
                  Show Correct Answers
                </Label>
                <span className="text-xs text-muted-foreground">
                  Reveal answer keys and explanations to participants after submission
                </span>
              </div>
              <Switch
                id="show-answers"
                checked={showCorrectAnswers}
                onCheckedChange={setShowCorrectAnswers}
              />
            </div>
          </CardContent>
        </Card>

        {/* Randomization & Pool Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.45_0.14_260)/12%] text-[oklch(0.45_0.14_260)]">
                <ShuffleIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Randomization & Pooling</CardTitle>
                <CardDescription className="text-xs">Prevent cheating with shuffled order and question pools</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="shuffle-q" className="font-semibold text-sm cursor-pointer">
                  Shuffle Questions
                </Label>
                <span className="text-xs text-muted-foreground">
                  Questions appear in random sequence for each participant
                </span>
              </div>
              <Switch
                id="shuffle-q"
                checked={shuffleQuestions}
                onCheckedChange={setShuffleQuestions}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="shuffle-opt" className="font-semibold text-sm cursor-pointer">
                  Shuffle Answer Options
                </Label>
                <span className="text-xs text-muted-foreground">
                  Multiple-choice choices are randomized per question
                </span>
              </div>
              <Switch
                id="shuffle-opt"
                checked={shuffleOptions}
                onCheckedChange={setShuffleOptions}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="questions-to-show" className="text-xs font-semibold">
                Question Pool Subset (Optional)
              </Label>
              <Input
                id="questions-to-show"
                type="number"
                min={1}
                placeholder="e.g. 10 (Leave blank to show all questions)"
                value={questionsToShow}
                onChange={(e) => setQuestionsToShow(e.target.value)}
                className="rounded-xl h-10"
              />
              <span className="text-[11px] text-muted-foreground">
                If specified, randomly picks this number of questions from the total pool
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="diff-dist-toggle" className="font-semibold text-sm cursor-pointer">
                  Difficulty Distribution
                </Label>
                <span className="text-xs text-muted-foreground">
                  Pick specific question counts by difficulty (e.g. 5 Easy + 10 Medium + 5 Hard)
                </span>
              </div>
              <Switch
                id="diff-dist-toggle"
                checked={hasDifficultyDist}
                onCheckedChange={setHasDifficultyDist}
              />
            </div>

            {hasDifficultyDist && (
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="easy-count" className="text-xs font-semibold text-emerald-600">
                    Easy Count
                  </Label>
                  <Input
                    id="easy-count"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    value={easyCount}
                    onChange={(e) => setEasyCount(e.target.value)}
                    className="rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="medium-count" className="text-xs font-semibold text-amber-600">
                    Medium Count
                  </Label>
                  <Input
                    id="medium-count"
                    type="number"
                    min={0}
                    placeholder="e.g. 10"
                    value={mediumCount}
                    onChange={(e) => setMediumCount(e.target.value)}
                    className="rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="hard-count" className="text-xs font-semibold text-rose-600">
                    Hard Count
                  </Label>
                  <Input
                    id="hard-count"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    value={hardCount}
                    onChange={(e) => setHardCount(e.target.value)}
                    className="rounded-lg h-9 text-xs"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Access Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[oklch(0.62_0.19_48)/12%] text-[oklch(0.62_0.19_48)]">
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Access & Leaderboard</CardTitle>
                <CardDescription className="text-xs">Control who can take this quiz and view rankings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="guest-toggle" className="font-semibold text-sm cursor-pointer">
                  Allow Guest Participants
                </Label>
                <span className="text-xs text-muted-foreground">
                  Anyone can take the quiz without logging in (names captured at start)
                </span>
              </div>
              <Switch
                id="guest-toggle"
                checked={allowGuests}
                onCheckedChange={setAllowGuests}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="leaderboard-toggle" className="font-semibold text-sm cursor-pointer">
                  Public Leaderboard
                </Label>
                <span className="text-xs text-muted-foreground">
                  Enable high score rankings table visible to all takers
                </span>
              </div>
              <Switch
                id="leaderboard-toggle"
                checked={enableLeaderboard}
                onCheckedChange={setEnableLeaderboard}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/60">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="access-code-toggle" className="font-semibold text-sm cursor-pointer">
                  Require Access Code
                </Label>
                <span className="text-xs text-muted-foreground">
                  Protect quiz with a passcode/PIN
                </span>
              </div>
              <Switch
                id="access-code-toggle"
                checked={hasAccessCode}
                onCheckedChange={setHasAccessCode}
              />
            </div>

            {hasAccessCode && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="access-code-input" className="text-xs font-semibold">
                  Access Passcode
                </Label>
                <div className="relative">
                  <LockIcon className="size-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="access-code-input"
                    placeholder="e.g. EXAM2026"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="rounded-xl h-10 pl-9 font-mono uppercase tracking-wider"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
