import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("JavaScript metrics tests", () => {
    const jsTestResourcesPath = "./resources/javascript/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, jsTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(jsTestResourcesPath);
    });

    describe("parses JavaScript Complexity metric", () => {
        it("should count if statements and logical operations (&& and ||) correctly", () => {
            testFileMetric("if-statements.js", FileMetric.complexity, 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.js", FileMetric.complexity, 12);
        });

        it("should not count multiple return statements within functions and methods", () => {
            testFileMetric("multiple-return-statements.js", FileMetric.complexity, 3);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.js", FileMetric.complexity, 3);
        });

        it("should count case but no default statements correctly", () => {
            testFileMetric("case-statements.js", FileMetric.complexity, 4);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.js", FileMetric.complexity, 1);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.js", FileMetric.complexity, 3);
        });
    });

    describe("parses JavaScript classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.js", FileMetric.classes, 3);
        });
    });

    describe("parses JavaScript functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.js", FileMetric.functions, 11);
        });
        it("should count all methods in object definition", () => {
            testFileMetric("object-method.js", FileMetric.functions, 4);
        });
    });

    describe("parses JavaScript comment lines metric", () => {
        it("should count comments properly, also counting file header, class description, html and doc block tag comment lines", async () => {
            testFileMetric("comments.js", FileMetric.commentLines, 18);
        });

        it("should count comments properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.js", FileMetric.commentLines, 4);
        });

        it("should count comments properly, also counting multiline block comments starting in the same line as another comment", () => {
            testFileMetric("consecutive-comments.js", FileMetric.commentLines, 6);
        });
    });

    describe("parses JavaScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("classes.js", FileMetric.linesOfCode, 24);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.js", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.js", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.js", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses JavaScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("comments.js", FileMetric.realLinesOfCode, 7);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.js", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric("single-comment.js", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.js", FileMetric.realLinesOfCode, 3);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.js", FileMetric.realLinesOfCode, 32);
        });
    });
});
