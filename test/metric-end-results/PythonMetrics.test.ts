import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/Metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, pythonTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(pythonTestResourcesPath);
    });

    describe("parses Python Complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric("loops.py", "complexity", 6);
        });

        it("should count if statements correctly", () => {
            testFileMetric("if-statements.py", "complexity", 6);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.py", "complexity", 1);
        });

        it("should count switch case labels and guards, but no default labels", () => {
            testFileMetric("case-statements.py", "complexity", 5);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.py", "complexity", 9);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.py", "complexity", 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.py", "complexity", 2);
        });
    });

    describe("parses Python classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.py", "classes", 4);
        });
    });

    describe("parses Python functions metric", () => {
        it("should count functions, methods properly", () => {
            testFileMetric("functions-and-methods.py", "functions", 9);
        });
    });

    describe("parses Python comment lines metric", () => {
        it("should count correctly, including inline and block comments", () => {
            testFileMetric("block-comment.py", "comment_lines", 7);
        });

        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.py", "comment_lines", 11);
        });
    });

    describe("parses Python lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("classes.py", "lines_of_code", 19);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.py", "lines_of_code", 1);
        });

        it("should count number of lines correctly for a file with one non-empty line", () => {
            testFileMetric("one-line.py", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.py", "lines_of_code", 2);
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", () => {
            testFileMetric("blocks.py", "real_lines_of_code", 9);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.py", "real_lines_of_code", 0);
        });

        it("should count correctly for a non-empty file with nested loops and comments", () => {
            testFileMetric("loops.py", "real_lines_of_code", 17);
        });

        it("should count correctly in the presence of block comments", () => {
            testFileMetric("block-comment.py", "real_lines_of_code", 3);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.py", "keywords_in_comments", 16);
        });
    });
});
