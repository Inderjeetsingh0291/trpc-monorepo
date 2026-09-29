/**
 * Test helpers for mocking the database layer.
 *
 * Usage in test files:
 *   import { createMockDb, mockDbQuery } from "../__tests__/helpers/db-mock"
 *
 * Pattern: vi.mock("@repo/database") before importing the service,
 * then use mockDbQuery to set return values per-test.
 */
import { vi } from "vitest"

// ---------------------------------------------------------------------------
// Chainable query builder mock
// ---------------------------------------------------------------------------

/**
 * Creates a mock database that satisfies Drizzle's chainable query API.
 * Each call to .from(), .where(), .orderBy(), etc. returns the same builder
 * so chains like `db.select().from(t).where(c)` resolve correctly.
 *
 * Override the final resolved value via `queryResult`.
 */
export function createChainableMock(resolvedValue: unknown = []) {
    let _resolved = resolvedValue

    const builder: any = {
        // Terminal operations
        then: (resolve: any, reject: any) =>
            Promise.resolve(_resolved).then(resolve, reject),

        // Chainable operations — each returns itself
        from: () => builder,
        where: () => builder,
        orderBy: () => builder,
        limit: () => builder,
        offset: () => builder,
        leftJoin: () => builder,
        innerJoin: () => builder,
        groupBy: () => builder,
        having: () => builder,
        returning: () => builder,
        set: () => builder,
        values: () => builder,

        // For transaction support
        transaction: (fn: (tx: any) => Promise<unknown>) => fn(builder),

        // Resolve override — call this in beforeEach/test to set up query responses
        __setResult: (value: unknown) => {
            _resolved = value
        },
    }

    return builder
}

// ---------------------------------------------------------------------------
// DB module factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a mock db object with the most common Drizzle methods.
 * Each method gets its own chainable builder so return values can be set independently.
 *
 * @example
 * const mockDb = createMockDb()
 * vi.mock("@repo/database", () => ({ db: mockDb, eq: vi.fn((a,b)=>true), ... }))
 */
export function createMockDb() {
    return {
        select: vi.fn().mockReturnValue(createChainableMock([])),
        insert: vi.fn().mockReturnValue(createChainableMock([])),
        update: vi.fn().mockReturnValue(createChainableMock([])),
        delete: vi.fn().mockReturnValue(createChainableMock([])),
        transaction: vi.fn().mockImplementation(
            (fn: (tx: any) => Promise<unknown>) => fn(createChainableMock([]))
        ),
    }
}

// ---------------------------------------------------------------------------
// Drizzle operator stubs
// ---------------------------------------------------------------------------

/** Stub for drizzle `eq`, `and`, `or`, etc. operators that just return a truthy marker */
export const drizzleOps = {
    eq: vi.fn((_col: any, _val: any) => Symbol("eq")),
    and: vi.fn((..._args: any[]) => Symbol("and")),
    or: vi.fn((..._args: any[]) => Symbol("or")),
    count: vi.fn(() => ({ count: 0 })),
    desc: vi.fn((col: any) => col),
    asc: vi.fn((col: any) => col),
    inArray: vi.fn((_col: any, _vals: any[]) => Symbol("inArray")),
    notEq: vi.fn((_col: any, _val: any) => Symbol("notEq")),
}

// ---------------------------------------------------------------------------
// UUID helper
// ---------------------------------------------------------------------------

export function uuid(seed = 0): string {
    const hex = seed.toString(16).padStart(8, "0")
    return `${hex}-0000-4000-a000-000000000000`
}
