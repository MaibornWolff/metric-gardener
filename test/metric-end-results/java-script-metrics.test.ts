import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./test-helper.js";

describe("JavaScript metrics tests", () => {
    const jsTestResourcesPath = "./resources/javascript/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, jsTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(jsTestResourcesPath);
    });

    describe("parses JavaScript Complexity metric", () => {
        it("should count if statements and logical operations (&& and ||) correctly", () => {
            testFileMetric("if-statements.js", "complexity", 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.js", "complexity", 12);
        });

        it("should not count multiple return statements within functions and methods", () => {
            testFileMetric("multiple-return-statements.js", "complexity", 3);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.js", "complexity", 3);
        });

        it("should count case but no default statements correctly", () => {
            testFileMetric("case-statements.js", "complexity", 4);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.js", "complexity", 1);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.js", "complexity", 3);
        });
    });

    describe("parses JavaScript classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.js", "classes", 3);
        });
    });

    describe("parses JavaScript functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.js", "functions", 11);
        });
        it("should count all methods in object definition", () => {
            testFileMetric("object-method.js", "functions", 4);
        });
        it("should count static initialization block", () => {
            testFileMetric("static-initialization-block.js", "functions", 1);
        });
    });

    describe("parses JavaScript comment lines metric", () => {
        it("should count comments properly, also counting file header, class description, html and doc block tag comment lines", () => {
            testFileMetric("comments.js", "comment_lines", 18);
        });

        it("should count comments properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.js", "comment_lines", 4);
        });

        it("should count comments properly, also counting multiline block comments starting in the same line as another comment", () => {
            testFileMetric("consecutive-comments.js", "comment_lines", 6);
        });
    });

    describe("parses JavaScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("classes.js", "lines_of_code", 24);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.js", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.js", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.js", "lines_of_code", 2);
        });
    });

    describe("parses JavaScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("comments.js", "real_lines_of_code", 7);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.js", "real_lines_of_code", 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric("single-comment.js", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.js", "real_lines_of_code", 3);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.js", "real_lines_of_code", 32);
        });
    });
    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.js", "keywords_in_comments", 8);
        });
    });
});
