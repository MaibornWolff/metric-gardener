module.exports = {
    setupFilesAfterEnv: ["./jest.setup.js"],
    collectCoverage: true,
    coverageDirectory: "<rootDir>/dist/coverage",
    collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}", "!**/node_modules/**"],
    coveragePathIgnorePatterns: ["(/__tests__/.*|\\.(test|e2e))\\.(ts|tsx)$"],
};
