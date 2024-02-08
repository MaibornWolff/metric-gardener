module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "body-case": [2, "always", "sentence-case"],
        "body-max-line-length": [2, "always", 72],
        "header-max-length": [2, "always", 72],
        "footer-max-length": [2, "always", 52],
        "type-enum": [
            2,
            "always",
            [
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "security",
                "style",
                "test",
                "release",
            ],
        ],
    },
};
