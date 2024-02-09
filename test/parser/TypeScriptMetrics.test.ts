import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("TypeScript metrics tests", () => {
    const tsTestResourcesPath = "./resources/typescript/";

    describe("parses TypeScript Complexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "if-statements.ts",
                FileMetric.complexity,
                8
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.complexity,
                9
            );
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "multiple-return-statements.ts",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetric(tsTestResourcesPath + "classes.ts", FileMetric.complexity, 0);
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "case-statements.ts",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", async () => {
            await testFileMetric(
                tsTestResourcesPath + "throw-try-catch-finally.ts",
                FileMetric.complexity,
                1
            );
        });

        it("should count loops properly", async () => {
            await testFileMetric(tsTestResourcesPath + "loops.ts", FileMetric.complexity, 3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetric(tsTestResourcesPath + "classes.ts", FileMetric.classes, 3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.functions,
                9
            );
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetric(tsTestResourcesPath + "comments.ts", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetric(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.commentLines,
                4
            );
        });

        it("should count properly, also counting multiline block comments starting in the same line as another comment", async () => {
            await testFileMetric(
                tsTestResourcesPath + "consecutive-comments.ts",
                FileMetric.commentLines,
                6
            );
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetric(
                tsTestResourcesPath + "ts-example-code.ts",
                FileMetric.linesOfCode,
                416
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetric(
                tsTestResourcesPath + "non-empty-last-line.ts",
                FileMetric.linesOfCode,
                415
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetric(tsTestResourcesPath + "empty.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetric(tsTestResourcesPath + "one-line.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetric(tsTestResourcesPath + "line-break.ts", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetric(
                tsTestResourcesPath + "real-lines-of-code.ts",
                FileMetric.realLinesOfCode,
                7
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(tsTestResourcesPath + "empty.ts", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", async () => {
            await testFileMetric(
                tsTestResourcesPath + "single-comment.ts",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetric(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.realLinesOfCode,
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetric(
                tsTestResourcesPath + "weird-lines.ts",
                FileMetric.realLinesOfCode,
                32
            );
        });
    });
});
