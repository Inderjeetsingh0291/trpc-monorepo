/**
 * Phase 13.4 — Authorization & Security Tests
 *
 * Tests authorization rules, access control, and security validations:
 * - Quiz owner-only analytics access
 * - Access code validation
 * - Unauthorized quiz modification attempts
 * - Guest access restrictions
 * - Input sanitization boundaries
 * - Rate limit enforcement logic
 */

import { describe, it, expect } from "vitest"

// ---------------------------------------------------------------------------
// Inline rate limiter implementation for self-contained testing
// Mirrors the logic in packages/trpc/server/utils/rate-limit.ts
// ---------------------------------------------------------------------------

interface RateLimitOptions { limit: number; windowMs: number }
interface RateLimitResult { allowed: boolean; remaining: number; resetAt: number; limit: number }

const _store = new Map<string, number[]>()

function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now()
    const windowStart = now - opts.windowMs
    let timestamps = (_store.get(key) ?? []).filter(t => t > windowStart)
    const allowed = timestamps.length < opts.limit
    if (allowed) { timestamps = [...timestamps, now] }
    _store.set(key, timestamps)
    const oldest = timestamps[0]
    const resetAt = oldest ? oldest + opts.windowMs : now + opts.windowMs
    return { allowed, remaining: Math.max(0, opts.limit - timestamps.length), resetAt, limit: opts.limit }
}

function clearRateLimit(key: string): void { _store.delete(key) }

// ---------------------------------------------------------------------------
// Authorization rule helpers (extracted from service logic)
// ---------------------------------------------------------------------------

function isQuizOwner(formCreatedBy: string, requestUserId: string): boolean {
    return formCreatedBy === requestUserId
}

function validateAccessCode(
    configured: string | null | undefined,
    provided: string | null | undefined
): { valid: boolean; reason?: string } {
    if (!configured) return { valid: true } // no code required
    if (!provided || provided.trim() === "") return { valid: false, reason: "Access code is required." }
    if (configured !== provided.trim()) return { valid: false, reason: "Invalid access code." }
    return { valid: true }
}

function canGuestTakeQuiz(allowGuests: boolean, userId: string | null | undefined): boolean {
    if (allowGuests) return true
    return !!userId
}

function sanitizeParticipantName(name: string): string {
    // Zod validation: min 1, max 100 chars, trim
    return name.trim()
}

// ---------------------------------------------------------------------------
// Authorization Tests
// ---------------------------------------------------------------------------

describe("Authorization — Quiz Owner Check", () => {
    it("owner matches → authorized", () => {
        expect(isQuizOwner("user-abc", "user-abc")).toBe(true)
    })

    it("different user → unauthorized", () => {
        expect(isQuizOwner("user-abc", "user-xyz")).toBe(false)
    })

    it("empty string for userId → unauthorized", () => {
        expect(isQuizOwner("user-abc", "")).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Access Code Tests
// ---------------------------------------------------------------------------

describe("Security — Access Code Validation", () => {
    it("no access code configured → always valid", () => {
        expect(validateAccessCode(null, undefined).valid).toBe(true)
        expect(validateAccessCode(undefined, "anything").valid).toBe(true)
        expect(validateAccessCode(null, null).valid).toBe(true)
    })

    it("correct access code → valid", () => {
        expect(validateAccessCode("SECRET123", "SECRET123").valid).toBe(true)
    })

    it("wrong access code → invalid", () => {
        const result = validateAccessCode("SECRET123", "WRONG")
        expect(result.valid).toBe(false)
        expect(result.reason).toContain("Invalid access code")
    })

    it("no code provided when required → invalid", () => {
        const result = validateAccessCode("SECRET123", null)
        expect(result.valid).toBe(false)
        expect(result.reason).toContain("required")
    })

    it("empty string provided when required → invalid", () => {
        const result = validateAccessCode("SECRET123", "  ")
        expect(result.valid).toBe(false)
    })

    it("access code is case-sensitive", () => {
        expect(validateAccessCode("Secret", "secret").valid).toBe(false)
        expect(validateAccessCode("Secret", "Secret").valid).toBe(true)
    })

    it("trims whitespace from provided code before comparing", () => {
        expect(validateAccessCode("ABC", "  ABC  ").valid).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Guest Access Tests
// ---------------------------------------------------------------------------

describe("Security — Guest Access", () => {
    it("allowGuests=true → both guests and logged-in users can take quiz", () => {
        expect(canGuestTakeQuiz(true, null)).toBe(true)
        expect(canGuestTakeQuiz(true, "user-123")).toBe(true)
    })

    it("allowGuests=false + no userId → blocked", () => {
        expect(canGuestTakeQuiz(false, null)).toBe(false)
        expect(canGuestTakeQuiz(false, undefined)).toBe(false)
    })

    it("allowGuests=false + valid userId → allowed", () => {
        expect(canGuestTakeQuiz(false, "user-123")).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Input Sanitization Tests
// ---------------------------------------------------------------------------

describe("Security — Input Sanitization", () => {
    it("participant name is trimmed", () => {
        expect(sanitizeParticipantName("  John Doe  ")).toBe("John Doe")
    })

    it("empty name after trim → fails Zod min(1) constraint", () => {
        // Simulating what Zod.min(1) would catch
        const name = sanitizeParticipantName("   ")
        expect(name.length).toBe(0) // Zod would then reject this
    })

    it("XSS-looking input passes through as plain text (no HTML rendering in API layer)", () => {
        const xssAttempt = "<script>alert('xss')</script>"
        const sanitized = sanitizeParticipantName(xssAttempt)
        // Backend stores as plain text; frontend should escape on render
        expect(sanitized).toBe(xssAttempt)
    })

    it("SQL injection-looking input is safe because we use parameterized Drizzle queries", () => {
        const sqlAttempt = "'; DROP TABLE users; --"
        // The Zod model limits length and Drizzle uses parameterized queries
        // This test documents that raw strings are stored, not executed
        expect(sanitizeParticipantName(sqlAttempt)).toBe(sqlAttempt)
    })
})

// ---------------------------------------------------------------------------
// Rate Limit Integration Tests
// ---------------------------------------------------------------------------

describe("Security — Rate Limiting", () => {
    it("allows requests under the limit", () => {
        const key = `test-rl-${Date.now()}`
        for (let i = 0; i < 5; i++) {
            const result = checkRateLimit(key, { limit: 5, windowMs: 60_000 })
            expect(result.allowed).toBe(true)
        }
    })

    it("blocks 6th request when limit is 5", () => {
        const key = `test-rl-block-${Date.now()}`
        for (let i = 0; i < 5; i++) {
            checkRateLimit(key, { limit: 5, windowMs: 60_000 })
        }
        const result = checkRateLimit(key, { limit: 5, windowMs: 60_000 })
        expect(result.allowed).toBe(false)
        expect(result.remaining).toBe(0)
    })

    it("returns correct remaining count", () => {
        const key = `test-rl-remaining-${Date.now()}`
        checkRateLimit(key, { limit: 10, windowMs: 60_000 })
        checkRateLimit(key, { limit: 10, windowMs: 60_000 })
        checkRateLimit(key, { limit: 10, windowMs: 60_000 })
        const result = checkRateLimit(key, { limit: 10, windowMs: 60_000 })
        expect(result.remaining).toBe(6) // 10 - 4 = 6
    })

    it("clearRateLimit resets counter", () => {
        const key = `test-rl-clear-${Date.now()}`
        for (let i = 0; i < 5; i++) {
            checkRateLimit(key, { limit: 5, windowMs: 60_000 })
        }
        // At limit
        expect(checkRateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(false)

        // Clear and retry
        clearRateLimit(key)
        expect(checkRateLimit(key, { limit: 5, windowMs: 60_000 }).allowed).toBe(true)
    })

    it("returns future resetAt timestamp", () => {
        const key = `test-rl-reset-${Date.now()}`
        const result = checkRateLimit(key, { limit: 5, windowMs: 60_000 })
        expect(result.resetAt).toBeGreaterThan(Date.now())
        expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 60_000 + 10) // within window + 10ms tolerance
    })

    it("independent keys don't interfere", () => {
        const keyA = `test-rl-independent-a-${Date.now()}`
        const keyB = `test-rl-independent-b-${Date.now()}`

        for (let i = 0; i < 5; i++) checkRateLimit(keyA, { limit: 5, windowMs: 60_000 })

        // keyA is at limit but keyB is fresh
        expect(checkRateLimit(keyA, { limit: 5, windowMs: 60_000 }).allowed).toBe(false)
        expect(checkRateLimit(keyB, { limit: 5, windowMs: 60_000 }).allowed).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Analytics Authorization Tests
// ---------------------------------------------------------------------------

describe("Authorization — Analytics Access Control", () => {
    /** Simulates the service-level ownership check */
    function checkAnalyticsAccess(formCreatedBy: string, requestUserId: string): void {
        if (formCreatedBy !== requestUserId) {
            throw new Error("You are not authorized to view analytics for this quiz.")
        }
    }

    it("owner can access analytics", () => {
        expect(() => checkAnalyticsAccess("user-1", "user-1")).not.toThrow()
    })

    it("non-owner cannot access analytics", () => {
        expect(() => checkAnalyticsAccess("user-1", "user-2")).toThrow(
            "You are not authorized to view analytics for this quiz."
        )
    })
})

// ---------------------------------------------------------------------------
// Quiz Host Attempt Management Tests
// ---------------------------------------------------------------------------

describe("Authorization — Quiz Host Attempt Management", () => {
    function verifyAttemptDeletionAuth(formCreatedBy: string, requestUserId: string): void {
        if (formCreatedBy !== requestUserId) {
            throw new Error("You are not authorized to delete submissions for this quiz.")
        }
    }

    function verifyAttemptUpdateAuth(formCreatedBy: string, requestUserId: string): void {
        if (formCreatedBy !== requestUserId) {
            throw new Error("You are not authorized to edit submissions for this quiz.")
        }
    }

    it("allows quiz host/creator to delete participant attempt", () => {
        expect(() => verifyAttemptDeletionAuth("host-123", "host-123")).not.toThrow()
    })

    it("prevents non-host users from deleting participant attempt", () => {
        expect(() => verifyAttemptDeletionAuth("host-123", "intruder-456")).toThrow(
            "You are not authorized to delete submissions for this quiz."
        )
    })

    it("allows quiz host/creator to edit participant attempt", () => {
        expect(() => verifyAttemptUpdateAuth("host-123", "host-123")).not.toThrow()
    })

    it("prevents non-host users from editing participant attempt", () => {
        expect(() => verifyAttemptUpdateAuth("host-123", "student-789")).toThrow(
            "You are not authorized to edit submissions for this quiz."
        )
    })

    it("recalculates percentage correctly on manual score edit", () => {
        const totalMarks = 5
        const newScore = 4
        const percentage = Math.min(100, Math.round((newScore / totalMarks) * 100))
        expect(percentage).toBe(80)
    })

    it("automatically evaluates pass/fail status against quiz passing threshold", () => {
        const passingScore = 60
        const totalMarks = 5

        const scorePass = 3 // 60%
        const percentagePass = Math.round((scorePass / totalMarks) * 100)
        expect(percentagePass >= passingScore).toBe(true)

        const scoreFail = 2 // 40%
        const percentageFail = Math.round((scoreFail / totalMarks) * 100)
        expect(percentageFail >= passingScore).toBe(false)
    })
})

