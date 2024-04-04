module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
    },
    plugins: ["@typescript-eslint", "unused-imports"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    ignorePatterns: ["dist", "resources"],
    rules: {
        "no-empty": ["error", { allowEmptyCatch: true }],
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            },
        ],
    },
};
