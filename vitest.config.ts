import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reportsDirectory: "./dist/coverage/",
            include: ["src/**"],
        },
        isolate: false,
        pool: "forks",
        restoreMocks: true,
    },
});
