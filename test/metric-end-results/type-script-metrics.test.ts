import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./test-helper.js";

describe("TypeScript metrics tests", () => {
    const tsTestResourcesPath = "./resources/typescript/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, tsTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(tsTestResourcesPath);
    });

    describe("parses TypeScript Complexity metric", () => {
        it("should count if statements correctly", () => {
            testFileMetric("if-statements.ts", "complexity", 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.ts", "complexity", 9);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.ts", "complexity", 3);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.ts", "complexity", 0);
        });

        it("should count case but no default statements correctly", () => {
            testFileMetric("case-statements.ts", "complexity", 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.ts", "complexity", 1);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.ts", "complexity", 3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.ts", "classes", 3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.ts", "functions", 9);
        });
        it("should count static initialization block", () => {
            testFileMetric("static_init_block.ts", "functions", 1);
        });
    });

    describe("parses TypeScript comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.ts", "comment_lines", 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.ts", "comment_lines", 4);
        });

        it("should count properly, also counting multiline block comments starting in the same line as another comment", () => {
            testFileMetric("consecutive-comments.ts", "comment_lines", 6);
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("ts-example-code.ts", "lines_of_code", 416);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.ts", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.ts", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.ts", "lines_of_code", 2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("real-lines-of-code.ts", "real_lines_of_code", 7);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.ts", "real_lines_of_code", 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric("single-comment.ts", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.ts", "real_lines_of_code", 3);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.ts", "real_lines_of_code", 32);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.ts", "keywords_in_comments", 10);
        });
    });
});
