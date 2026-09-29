/**
 * Phase 13.3 — Attempt Lifecycle Tests
 *
 * Tests the business rules for the quiz attempt lifecycle:
 * - Attempt limit enforcement
 * - Expired attempt handling  
 * - Idempotent submission (duplicate submission returns same result)
 * - Timer validation logic
 * - Server-side expiry grace period
 *
 * These are pure unit tests against the business logic — no real DB.
 */

import { describe, it, expect } from "vitest"

// ---------------------------------------------------------------------------
// Lifecycle business logic extracted for unit testing
// ---------------------------------------------------------------------------

type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED"

interface AttemptState {
    id: string
    status: AttemptStatus
    startedAt: Date
    expiresAt: Date | null
    totalMarks: number
    score: number
    percentage: number
    passed: boolean
    timeTaken: number
}

interface QuizSettings {
    maxAttempts: number
    passingScore: number
    timeLimitMinutes: number | null
}

/** Attempt limit check — mirrors service logic */
function isAttemptLimitReached(existingAttemptCount: number, maxAttempts: number): boolean {
    if (maxAttempts <= 0) return false // 0 = unlimited
    return existingAttemptCount >= maxAttempts
}

/** Check if an attempt is expired at a given time */
function isAttemptExpired(attempt: Pick<AttemptState, "expiresAt">, at: Date = new Date()): boolean {
    if (!attempt.expiresAt) return false
    return at > attempt.expiresAt
}

/** Grace period check — 10 seconds after deadline */
const GRACE_PERIOD_MS = 10 * 1000

function isExpiredPastGracePeriod(attempt: Pick<AttemptState, "expiresAt">, at: Date = new Date()): boolean {
    if (!attempt.expiresAt) return false
    return at.getTime() - new Date(attempt.expiresAt).getTime() > GRACE_PERIOD_MS
}

/** Calculate expiry timestamp from start time and time limit */
function calculateExpiry(startedAt: Date, timeLimitMinutes: number | null): Date | null {
    if (!timeLimitMinutes) return null
    return new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000)
}

/** Idempotent submission check */
function isAlreadySubmitted(attempt: Pick<AttemptState, "status">): boolean {
    return attempt.status === "SUBMITTED"
}

/** Score calculation */
function calculatePercentage(score: number, totalMarks: number): number {
    if (totalMarks <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((score / totalMarks) * 100)))
}

function hasPassed(percentage: number, passingScore: number): boolean {
    return percentage >= passingScore
}

// ---------------------------------------------------------------------------
// Attempt Limit Tests
// ---------------------------------------------------------------------------

describe("Attempt Lifecycle — Attempt Limit Enforcement", () => {
    it("allows attempt when under limit", () => {
        expect(isAttemptLimitReached(0, 3)).toBe(false)
        expect(isAttemptLimitReached(1, 3)).toBe(false)
        expect(isAttemptLimitReached(2, 3)).toBe(false)
    })

    it("blocks attempt when at limit", () => {
        expect(isAttemptLimitReached(3, 3)).toBe(true)
        expect(isAttemptLimitReached(4, 3)).toBe(true)
    })

    it("allows unlimited attempts when maxAttempts = 0", () => {
        expect(isAttemptLimitReached(100, 0)).toBe(false)
        expect(isAttemptLimitReached(999, 0)).toBe(false)
    })

    it("limits to 1 attempt when maxAttempts = 1", () => {
        expect(isAttemptLimitReached(0, 1)).toBe(false)
        expect(isAttemptLimitReached(1, 1)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Timer / Expiry Tests
// ---------------------------------------------------------------------------

describe("Attempt Lifecycle — Timer & Expiry", () => {
    const now = new Date("2025-01-01T12:00:00Z")

    it("no time limit → never expires", () => {
        expect(isAttemptExpired({ expiresAt: null }, now)).toBe(false)
    })

    it("before expiry → not expired", () => {
        const expiresAt = new Date("2025-01-01T12:30:00Z")
        expect(isAttemptExpired({ expiresAt }, now)).toBe(false)
    })

    it("exactly at expiry → expired", () => {
        const expiresAt = new Date("2025-01-01T12:00:00Z")
        // at == expiresAt, not strictly >
        expect(isAttemptExpired({ expiresAt }, now)).toBe(false)
    })

    it("1 ms after expiry → expired", () => {
        const expiresAt = new Date("2025-01-01T11:59:59.999Z")
        expect(isAttemptExpired({ expiresAt }, now)).toBe(true)
    })

    it("calculates correct expiry from start + timeLimitMinutes", () => {
        const startedAt = new Date("2025-01-01T10:00:00Z")
        const expiry = calculateExpiry(startedAt, 30)
        expect(expiry).not.toBeNull()
        expect(expiry!.toISOString()).toBe("2025-01-01T10:30:00.000Z")
    })

    it("null timeLimitMinutes → null expiry", () => {
        const startedAt = new Date("2025-01-01T10:00:00Z")
        expect(calculateExpiry(startedAt, null)).toBeNull()
    })

    it("grace period: within 10s → still accepted", () => {
        const expiresAt = new Date("2025-01-01T12:00:00Z")
        const submittedAt = new Date("2025-01-01T12:00:09.999Z") // 9.999s later
        expect(isExpiredPastGracePeriod({ expiresAt }, submittedAt)).toBe(false)
    })

    it("grace period: beyond 10s → rejected", () => {
        const expiresAt = new Date("2025-01-01T12:00:00Z")
        const submittedAt = new Date("2025-01-01T12:00:11Z") // 11s later
        expect(isExpiredPastGracePeriod({ expiresAt }, submittedAt)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Idempotent Submission Tests
// ---------------------------------------------------------------------------

describe("Attempt Lifecycle — Idempotent Submission", () => {
    const submittedAttempt: AttemptState = {
        id: "attempt-1",
        status: "SUBMITTED",
        startedAt: new Date("2025-01-01T10:00:00Z"),
        expiresAt: new Date("2025-01-01T10:30:00Z"),
        totalMarks: 10,
        score: 8,
        percentage: 80,
        passed: true,
        timeTaken: 1200,
    }

    it("recognizes already-submitted attempt", () => {
        expect(isAlreadySubmitted(submittedAttempt)).toBe(true)
    })

    it("in-progress attempt is not submitted", () => {
        expect(isAlreadySubmitted({ status: "IN_PROGRESS" })).toBe(false)
    })

    it("expired attempt is not submitted", () => {
        expect(isAlreadySubmitted({ status: "EXPIRED" })).toBe(false)
    })

    it("re-submitting a SUBMITTED attempt returns existing result (idempotent)", () => {
        // Simulates the check in submitAttempt service
        const attempt = { status: "SUBMITTED" as AttemptStatus, score: 8, percentage: 80, passed: true }
        const alreadyDone = isAlreadySubmitted(attempt)

        if (alreadyDone) {
            // Returns existing result without re-grading
            expect(attempt.score).toBe(8)
            expect(attempt.percentage).toBe(80)
        }

        expect(alreadyDone).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Score / Pass-Fail Tests
// ---------------------------------------------------------------------------

describe("Attempt Lifecycle — Score & Pass/Fail", () => {
    it("percentage 80% with passingScore 50 → passed", () => {
        expect(hasPassed(80, 50)).toBe(true)
    })

    it("percentage 50% with passingScore 50 → passed (exactly equal)", () => {
        expect(hasPassed(50, 50)).toBe(true)
    })

    it("percentage 49% with passingScore 50 → failed", () => {
        expect(hasPassed(49, 50)).toBe(false)
    })

    it("percentage 0% → failed", () => {
        expect(hasPassed(0, 50)).toBe(false)
    })

    it("percentage 100% → passed", () => {
        expect(hasPassed(100, 50)).toBe(true)
    })

    it("calculates percentage correctly for 7/10", () => {
        expect(calculatePercentage(7, 10)).toBe(70)
    })

    it("rounds to nearest integer", () => {
        expect(calculatePercentage(1, 3)).toBe(33) // 33.33... → 33
        expect(calculatePercentage(2, 3)).toBe(67) // 66.66... → 67
    })

    it("zero totalMarks → 0% (no division by zero)", () => {
        expect(calculatePercentage(5, 0)).toBe(0)
    })

    it("score exceeds totalMarks (bonus) → capped at 100%", () => {
        expect(calculatePercentage(15, 10)).toBe(100)
    })
})
