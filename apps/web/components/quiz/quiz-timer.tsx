"use client"

import { useEffect, useState, useRef } from "react"
import { ClockIcon, AlertTriangleIcon } from "lucide-react"

interface QuizTimerProps {
  expiresAt: string | Date | null | undefined
  onExpire?: () => void
}

export function QuizTimer({ expiresAt, onExpire }: QuizTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null)
      return
    }

    const expiryTime = new Date(expiresAt).getTime()

    const calculateTime = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000))
      setSecondsLeft(diff)

      if (diff === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        onExpire?.()
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  if (secondsLeft === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs font-semibold text-muted-foreground">
        <ClockIcon className="size-4 text-muted-foreground" />
        <span>Untimed</span>
      </div>
    )
  }

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  // Urgency states
  const isCritical = secondsLeft <= 60
  const isWarning = secondsLeft <= 300 && !isCritical

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold transition-all ${
        isCritical
          ? "border-rose-500 bg-rose-500/10 text-rose-600 animate-pulse shadow-xs"
          : isWarning
          ? "border-amber-500 bg-amber-500/10 text-amber-600 shadow-xs"
          : "border-border/80 bg-background/80 text-foreground"
      }`}
    >
      {isCritical ? (
        <AlertTriangleIcon className="size-4 text-rose-500 animate-bounce" />
      ) : (
        <ClockIcon
          className={`size-4 ${
            isWarning ? "text-amber-500" : "text-[oklch(0.62_0.19_48)]"
          }`}
        />
      )}
      <span>{formattedTime}</span>
    </div>
  )
}
