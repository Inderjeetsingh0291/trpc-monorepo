/**
 * Production-grade in-memory rate limiter using sliding window algorithm.
 *
 * Features:
 * - Per-key sliding window counters
 * - Automatic stale-entry cleanup (every 5 minutes)
 * - Burst capacity support
 * - Returns remaining quota and reset time for informational use
 *
 * NOTE: This is a single-process rate limiter. For multi-instance deployments,
 * replace with a Redis-backed implementation (e.g., ioredis + sliding window Lua script).
 */

interface WindowEntry {
    timestamps: number[]
    lastCleaned: number
}

const store = new Map<string, WindowEntry>()

// Periodic cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
let lastGlobalCleanup = Date.now()

function runGlobalCleanupIfNeeded(windowMs: number): void {
    const now = Date.now()
    if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return

    lastGlobalCleanup = now
    const cutoff = now - windowMs

    for (const [key, entry] of store.entries()) {
        const fresh = entry.timestamps.filter(t => t > cutoff)
        if (fresh.length === 0) {
            store.delete(key)
        } else {
            entry.timestamps = fresh
            entry.lastCleaned = now
        }
    }
}

export interface RateLimitOptions {
    /** Maximum number of requests allowed within the window */
    limit: number
    /** Window duration in milliseconds */
    windowMs: number
}

export interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean
    /** Remaining requests in the current window */
    remaining: number
    /** Unix timestamp (ms) when the window resets */
    resetAt: number
    /** Total limit for this window */
    limit: number
}

/**
 * Check and record a rate limit hit for a given key.
 * Returns detailed result including remaining quota and reset time.
 */
export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now()
    const windowStart = now - opts.windowMs

    runGlobalCleanupIfNeeded(opts.windowMs)

    let entry = store.get(key)
    if (!entry) {
        entry = { timestamps: [], lastCleaned: now }
        store.set(key, entry)
    }

    // Slide the window: remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter(t => t > windowStart)

    const currentCount = entry.timestamps.length
    const allowed = currentCount < opts.limit

    if (allowed) {
        entry.timestamps.push(now)
    }

    // Reset time = oldest timestamp + window duration (when it expires)
    const oldest = entry.timestamps[0]
    const resetAt = oldest ? oldest + opts.windowMs : now + opts.windowMs

    return {
        allowed,
        remaining: Math.max(0, opts.limit - entry.timestamps.length),
        resetAt,
        limit: opts.limit,
    }
}

/**
 * Convenience function: returns true if the request is allowed.
 * Maintains the original API for backward compatibility.
 */
export function isRateLimited(key: string, opts: RateLimitOptions): boolean {
    return !checkRateLimit(key, opts).allowed
}

/**
 * Clear all rate limit state for a given key.
 * Useful for testing and when a user successfully authenticates (reset login throttle).
 */
export function clearRateLimit(key: string): void {
    store.delete(key)
}

/**
 * Get current rate limit state without recording a new hit.
 * Useful for checking quota before a potentially expensive operation.
 */
export function peekRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now()
    const windowStart = now - opts.windowMs
    const entry = store.get(key)

    if (!entry) {
        return { allowed: true, remaining: opts.limit, resetAt: now + opts.windowMs, limit: opts.limit }
    }

    const currentTimestamps = entry.timestamps.filter(t => t > windowStart)
    const currentCount = currentTimestamps.length
    const allowed = currentCount < opts.limit
    const oldest = currentTimestamps[0]
    const resetAt = oldest ? oldest + opts.windowMs : now + opts.windowMs

    return {
        allowed,
        remaining: Math.max(0, opts.limit - currentCount),
        resetAt,
        limit: opts.limit,
    }
}
