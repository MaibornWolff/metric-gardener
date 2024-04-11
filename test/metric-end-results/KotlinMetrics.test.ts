import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Kotlin metric tests", () => {
    const kotlinTestResourcesPath = "./resources/kotlin/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, kotlinTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(kotlinTestResourcesPath);
    });

    describe("parses Kotlin complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric("loops.kt", "complexity", 5);
        });

        it("should count if statements and logical operations (&& and ||) correctly", () => {
            testFileMetric("if-statements.kt", "complexity", 10);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.kt", "complexity", 4);
        });

        it("should count when case statements correctly, but not else statements", () => {
            testFileMetric("case-statements.kt", "complexity", 4);
        });

        it("should count all function declarations and one init block correctly", () => {
            testFileMetric("functions-and-methods.kt", "complexity", 11);
        });

        it("should not count multiple return statements within functions and methods", () => {
            testFileMetric("multiple-return-statements.kt", "complexity", 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.kt", "complexity", 3);
        });
    });

    describe("parses Kotlin classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.kt", "classes", 8);
        });
    });

    describe("parses Kotlin functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.kt", "functions", 10);
        });
    });

    describe("parses Kotlin commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.kt", "comment_lines", 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.kt", "comment_lines", 4);
        });
    });

    describe("parses Kotlin lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("kotlin-example-code.kt", "lines_of_code", 62);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("kotlin-example-code-2.kt", "lines_of_code", 31);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.kt", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.kt", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.kt", "lines_of_code", 2);
        });
    });

    describe("parses Kotlin real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("kotlin-example-code.kt", "real_lines_of_code", 50);
        });

        it("should count correctly for a non-empty file", () => {
            testFileMetric("kotlin-example-code-2.kt", "real_lines_of_code", 31);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.kt", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.kt", "real_lines_of_code", 5);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.kt", "real_lines_of_code", 30);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.kt", "keywords_in_comments", 8);
        });
    });
});
