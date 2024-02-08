const parseCommitMessage = require("@commitlint/parse");

module.exports = (parsed) => {
    const commitMessage = parsed.raw;
    const issueIdRegex = /\s#(\d+)$/; // Adjust the regex as needed

    if (!issueIdRegex.test(commitMessage)) {
        return [false, "Issue ID is required at the end of the commit message"];
    }

    return [true];
};
