/**
 * vitest.config.ts for @repo/services
 *
 * Configured for unit testing business logic with:
 * - In-process DB mocking via vi.mock (no real DB required)
 * - Coverage via @vitest/coverage-v8
 * - ~10s per-test timeout for any async service calls
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        testTimeout: 10_000,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json-summary"],
            include: ["**/*.ts"],
            exclude: [
                "node_modules/**",
                "**/*.config.ts",
                "**/*.test.ts",
                "**/model.ts",
            ],
        },
    },
});
