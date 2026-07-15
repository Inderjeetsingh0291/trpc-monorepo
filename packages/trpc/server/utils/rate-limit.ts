/**
 * Simple in-memory rate limiter using a sliding window.
 * Maps a key (e.g., IP address) to an array of timestamps.
 */
const store = new Map<string, number[]>()

interface RateLimitOptions {
    /** Maximum number of requests allowed within the window */
    limit: number
    /** Window duration in milliseconds */
    windowMs: number
}

/**
 * Returns true if the request is allowed; false if rate-limited.
 */
export function checkRateLimit(key: string, opts: RateLimitOptions): boolean {
    const now = Date.now()
    const windowStart = now - opts.windowMs

    const timestamps = (store.get(key) ?? []).filter(t => t > windowStart)
    timestamps.push(now)
    store.set(key, timestamps)

    return timestamps.length <= opts.limit
}
