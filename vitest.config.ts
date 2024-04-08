import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reporter: ["text", "json-summary", "json"],
            include: ["src/**"],
            reportOnFailure: true,
            thresholds: {
                statements: 75,
                branches: 85,
                functions: 90,
                lines: 75,
            },
        },
        isolate: false,
        pool: "forks",
        restoreMocks: true,
    },
});
