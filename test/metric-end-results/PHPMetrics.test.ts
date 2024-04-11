import { beforeAll, describe, expect, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/Metric.js";
import {
    expectFileMetric,
    getCouplingMetrics,
    mockConsole,
    mockWin32Path,
    parseAllFileMetrics,
} from "./TestHelper.js";

describe("PHP metrics tests", () => {
    const phpTestResourcesPath = "./resources/php/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, phpTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(phpTestResourcesPath);
    });

    describe("parses PHP Complexity metric", () => {
        it("should count branching statements correctly", () => {
            testFileMetric("if-statements.php", "complexity", 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.php", "complexity", 10);
        });

        it("should not count multiple return statements within functions and methods like sonar", () => {
            testFileMetric("multiple-return-statements.php", "complexity", 3);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.php", "complexity", 5);
        });

        it("should count case labels correctly", () => {
            testFileMetric("case-statements.php", "complexity", 3);
        });

        it("should count all conditional expressions in match expression", () => {
            testFileMetric("match-expression.php", "complexity", 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.php", "complexity", 1);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.php", "complexity", 4);
        });

        it("should count the logical operations &&, || and xor", () => {
            testFileMetric("logical-operations.php", "complexity", 3);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.php", "classes", 8);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations and definitions", () => {
            testFileMetric("functions-and-methods.php", "functions", 10);
        });

        it("should count all arrow functions.", () => {
            testFileMetric("arrow-functions.php", "functions", 8);
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("empty-last-line.php", "lines_of_code", 66);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("php-example-code.php", "lines_of_code", 65);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.php", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.php", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.php", "lines_of_code", 2);
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("php-example-code.php", "real_lines_of_code", 43);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.php", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.php", "real_lines_of_code", 11);
        });
    });

    describe("parses PHP commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets and comment " +
                "lines inside block comment",
            () => {
                testFileMetric("php-example-code.php", "comment_lines", 12);
            },
        );
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            mockConsole();
            mockWin32Path({ skip: ["join", "resolve", "normalize"] });
            const couplingResult = await getCouplingMetrics(
                phpTestResourcesPath + "coupling-examples/",
            );
            expect(couplingResult).toMatchSnapshot();
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.php", "keywords_in_comments", 8);
        });
    });
});
