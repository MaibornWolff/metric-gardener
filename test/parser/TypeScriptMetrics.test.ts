import { testFileMetrics } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("TypeScript metrics tests", () => {
    const tsTestResourcesPath = "./resources/typescript/";

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "if-statements.ts",
                FileMetric.mcCabeComplexity,
                8
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.mcCabeComplexity,
                9
            );
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "multiple-return-statements.ts",
                FileMetric.mcCabeComplexity,
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "classes.ts",
                FileMetric.mcCabeComplexity,
                0
            );
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "case-statements.ts",
                FileMetric.mcCabeComplexity,
                3
            );
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "throw-try-catch-finally.ts",
                FileMetric.mcCabeComplexity,
                2
            );
        });

        it("should count loops properly", async () => {
            await testFileMetrics(tsTestResourcesPath + "loops.ts", FileMetric.mcCabeComplexity, 3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetrics(tsTestResourcesPath + "classes.ts", FileMetric.classes, 3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.functions,
                9
            );
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetrics(tsTestResourcesPath + "comments.ts", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.commentLines,
                4
            );
        });

        it("should count properly, also counting multiline block comments starting in the same line as another comment", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "consecutive-comments.ts",
                FileMetric.commentLines,
                6
            );
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "ts-example-code.ts",
                FileMetric.linesOfCode,
                416
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "non-empty-last-line.ts",
                FileMetric.linesOfCode,
                415
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(tsTestResourcesPath + "empty.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(tsTestResourcesPath + "one-line.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(tsTestResourcesPath + "line-break.ts", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "real-lines-of-code.ts",
                FileMetric.realLinesOfCode,
                7
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetrics(tsTestResourcesPath + "empty.ts", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "single-comment.ts",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.realLinesOfCode,
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetrics(
                tsTestResourcesPath + "weird-lines.ts",
                FileMetric.realLinesOfCode,
                32
            );
        });
    });
});
