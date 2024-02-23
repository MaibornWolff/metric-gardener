import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("TypeScript metrics tests", () => {
    const tsTestResourcesPath = "./resources/typescript/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(tsTestResourcesPath);
    });

    describe("parses TypeScript Complexity metric", () => {
        it("should count if statements correctly", () => {
            testFileMetric(tsTestResourcesPath + "if-statements.ts", FileMetric.complexity, 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.complexity,
                9
            );
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric(
                tsTestResourcesPath + "multiple-return-statements.ts",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any class declaration", () => {
            testFileMetric(tsTestResourcesPath + "classes.ts", FileMetric.complexity, 0);
        });

        it("should count case but no default statements correctly", () => {
            testFileMetric(tsTestResourcesPath + "case-statements.ts", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric(
                tsTestResourcesPath + "throw-try-catch-finally.ts",
                FileMetric.complexity,
                1
            );
        });

        it("should count loops properly", () => {
            testFileMetric(tsTestResourcesPath + "loops.ts", FileMetric.complexity, 3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(tsTestResourcesPath + "classes.ts", FileMetric.classes, 3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric(
                tsTestResourcesPath + "functions-and-methods.ts",
                FileMetric.functions,
                9
            );
        });
    });

    describe("parses TypeScript comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric(tsTestResourcesPath + "comments.ts", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.commentLines,
                4
            );
        });

        it("should count properly, also counting multiline block comments starting in the same line as another comment", () => {
            testFileMetric(
                tsTestResourcesPath + "consecutive-comments.ts",
                FileMetric.commentLines,
                6
            );
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric(tsTestResourcesPath + "ts-example-code.ts", FileMetric.linesOfCode, 416);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(
                tsTestResourcesPath + "non-empty-last-line.ts",
                FileMetric.linesOfCode,
                415
            );
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(tsTestResourcesPath + "empty.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(tsTestResourcesPath + "one-line.ts", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(tsTestResourcesPath + "line-break.ts", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                tsTestResourcesPath + "real-lines-of-code.ts",
                FileMetric.realLinesOfCode,
                7
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(tsTestResourcesPath + "empty.ts", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric(
                tsTestResourcesPath + "single-comment.ts",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric(
                tsTestResourcesPath + "same-line-comment.ts",
                FileMetric.realLinesOfCode,
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric(tsTestResourcesPath + "weird-lines.ts", FileMetric.realLinesOfCode, 32);
        });
    });
});
