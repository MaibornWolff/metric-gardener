import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reporter: ["text", "json-summary", "json"],
            include: ["src/**"],
        },
        isolate: false,
        pool: "forks",
        restoreMocks: true,
    },
});
