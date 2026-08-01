"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UsePullRefreshOptions {
  onRefresh: () => Promise<void> | void
  /** The scroll container selector or element. Defaults to '[data-slot="sidebar-inset"]' */
  containerSelector?: string
  /** Minimum pull distance in pixels to trigger refresh */
  threshold?: number
}

export function usePullRefresh({
  onRefresh,
  containerSelector = '[data-slot="sidebar-inset"]',
  threshold = 80,
}: UsePullRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      // Small delay for visual feedback
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
        setIsPulling(false)
      }, 600)
    }
  }, [onRefresh])

  useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull-to-refresh when scrolled to top
      if (container.scrollTop <= 0) {
        startYRef.current = e.touches[0]!.clientY
        pullingRef.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || isRefreshing) return

      const currentY = e.touches[0]!.clientY
      const diff = currentY - startYRef.current

      if (diff > 0 && container.scrollTop <= 0) {
        // Apply resistance - the further you pull, the harder it gets
        const dampedDiff = Math.min(diff * 0.4, threshold * 1.5)
        setPullDistance(dampedDiff)
        setIsPulling(true)

        if (dampedDiff > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = () => {
      if (!pullingRef.current) return
      pullingRef.current = false

      if (pullDistance >= threshold && !isRefreshing) {
        handleRefresh()
      } else {
        setPullDistance(0)
        setIsPulling(false)
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [containerSelector, threshold, pullDistance, isRefreshing, handleRefresh])

  return { isPulling, pullDistance, isRefreshing, threshold }
}
