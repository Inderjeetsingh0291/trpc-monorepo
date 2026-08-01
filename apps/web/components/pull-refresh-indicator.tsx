"use client"

import { IconRefresh } from "@tabler/icons-react"

interface PullRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  threshold: number
}

export function PullRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold,
}: PullRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: isRefreshing ? 48 : pullDistance > 5 ? pullDistance : 0 }}
    >
      <div
        className={`flex size-8 items-center justify-center rounded-full bg-[oklch(0.62_0.19_48)] text-white shadow-lg transition-transform ${isRefreshing ? "animate-spin" : ""}`}
        style={
          isRefreshing
            ? undefined
            : { transform: `rotate(${rotation}deg) scale(${0.5 + progress * 0.5})` }
        }
      >
        <IconRefresh className="size-4" />
      </div>
      {pullDistance >= threshold && !isRefreshing && (
        <span className="ml-2 text-xs font-medium text-[oklch(0.5_0.04_50)]">
          Release to refresh
        </span>
      )}
      {isRefreshing && (
        <span className="ml-2 text-xs font-medium text-[oklch(0.5_0.04_50)]">
          Refreshing…
        </span>
      )}
    </div>
  )
}
