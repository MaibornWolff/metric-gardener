import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, pythonTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(pythonTestResourcesPath);
    });

    describe("parses Python Complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric("loops.py", FileMetric.complexity, 6);
        });

        it("should count if statements correctly", () => {
            testFileMetric("if-statements.py", FileMetric.complexity, 6);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.py", FileMetric.complexity, 1);
        });

        it("should count switch case labels and guards, but no default labels", () => {
            testFileMetric("case-statements.py", FileMetric.complexity, 5);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.py", FileMetric.complexity, 9);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.py", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.py", FileMetric.complexity, 2);
        });
    });

    describe("parses Python classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.py", FileMetric.classes, 4);
        });
    });

    describe("parses Python functions metric", () => {
        it("should count functions, methods properly", () => {
            testFileMetric("functions-and-methods.py", FileMetric.functions, 9);
        });
    });

    describe("parses Python comment lines metric", () => {
        it("should count correctly, including inline and block comments", () => {
            testFileMetric("block-comment.py", FileMetric.commentLines, 7);
        });

        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.py", FileMetric.commentLines, 11);
        });
    });

    describe("parses Python lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("classes.py", FileMetric.linesOfCode, 19);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.py", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for a file with one non-empty line", () => {
            testFileMetric("one-line.py", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.py", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", () => {
            testFileMetric("blocks.py", FileMetric.realLinesOfCode, 9);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.py", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a non-empty file with nested loops and comments", () => {
            testFileMetric("loops.py", FileMetric.realLinesOfCode, 17);
        });

        it("should count correctly in the presence of block comments", () => {
            testFileMetric("block-comment.py", FileMetric.realLinesOfCode, 3);
        });
    });
});
