import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reporter: ["text", "json-summary", "json"],
            include: ["src/**"],
            reportOnFailure: true,
            thresholds: {
                statements: 80,
                branches: 90,
                functions: 90,
                lines: 80,
            },
        },
        isolate: false,
        pool: "forks",
        restoreMocks: true,
    },
});
