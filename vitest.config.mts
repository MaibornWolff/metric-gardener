import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            reportsDirectory: "./dist/coverage/",
            include: ["src/**"],
        },
        globals: true,
        isolate: false,
        pool: "forks",
        // restoreMocks: true,
    },
});
