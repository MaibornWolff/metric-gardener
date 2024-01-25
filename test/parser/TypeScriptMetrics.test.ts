import { testFileMetrics } from "./TestHelper";

describe("TypeScript metrics tests", () => {
    const tsTestResourcesPath = "./resources/typescript/";

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetrics(tsTestResourcesPath + "if-statements.ts", "mcc", 8);
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(tsTestResourcesPath + "functions-and-methods.ts", "mcc", 9);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetrics(tsTestResourcesPath + "multiple-return-statements.ts", "mcc", 3);
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(tsTestResourcesPath + "classes.ts", "mcc", 0);
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetrics(tsTestResourcesPath + "case-statements.ts", "mcc", 3);
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetrics(tsTestResourcesPath + "throw-try-catch-finally.ts", "mcc", 2);
        });

        it("should count loops properly", async () => {
            await testFileMetrics(tsTestResourcesPath + "loops.ts", "mcc", 3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetrics(tsTestResourcesPath + "classes.ts", "classes", 3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetrics(tsTestResourcesPath + "functions-and-methods.ts", "functions", 9);
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetrics(tsTestResourcesPath + "comments.ts", "comment_lines", 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetrics(tsTestResourcesPath + "same-line-comment.ts", "comment_lines", 4);
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(tsTestResourcesPath + "ts-example-code.ts", "lines_of_code", 416);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "non-empty-last-line.ts",
                "lines_of_code",
                415
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(tsTestResourcesPath + "empty.ts", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(tsTestResourcesPath + "one-line.ts", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(tsTestResourcesPath + "line-break.ts", "lines_of_code", 2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "real-lines-of-code.ts",
                "real_lines_of_code",
                7
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "same-line-comment.ts",
                "real_lines_of_code",
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetrics(tsTestResourcesPath + "weird-lines.ts", "real_lines_of_code", 32);
        });
    });
});
