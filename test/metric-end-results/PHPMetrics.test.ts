import { beforeAll, describe, expect, it } from "vitest";
import { expectFileMetric, getCouplingMetrics, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("PHP metrics tests", () => {
    const phpTestResourcesPath = "./resources/php/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(phpTestResourcesPath);
    });

    describe("parses PHP Complexity metric", () => {
        it("should count branching statements correctly", () => {
            testFileMetric(phpTestResourcesPath + "if-statements.php", FileMetric.complexity, 8);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric(
                phpTestResourcesPath + "functions-and-methods.php",
                FileMetric.complexity,
                10,
            );
        });

        it("should not count multiple return statements within functions and methods like sonar", () => {
            testFileMetric(
                phpTestResourcesPath + "multiple-return-statements.php",
                FileMetric.complexity,
                3,
            );
        });

        it("should not count any class declaration", () => {
            testFileMetric(phpTestResourcesPath + "classes.php", FileMetric.complexity, 5);
        });

        it("should count case labels correctly", () => {
            testFileMetric(phpTestResourcesPath + "case-statements.php", FileMetric.complexity, 3);
        });

        it("should count all conditional expressions in match expression", () => {
            testFileMetric(phpTestResourcesPath + "match-expression.php", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric(
                phpTestResourcesPath + "throw-try-catch-finally.php",
                FileMetric.complexity,
                1,
            );
        });

        it("should count loops properly", () => {
            testFileMetric(phpTestResourcesPath + "loops.php", FileMetric.complexity, 4);
        });

        it("should count the logical operations &&, || and xor", () => {
            testFileMetric(
                phpTestResourcesPath + "logical-operations.php",
                FileMetric.complexity,
                3,
            );
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(phpTestResourcesPath + "classes.php", FileMetric.classes, 8);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations and definitions", () => {
            testFileMetric(
                phpTestResourcesPath + "functions-and-methods.php",
                FileMetric.functions,
                10,
            );
        });

        it("should count all arrow functions.", () => {
            testFileMetric(phpTestResourcesPath + "arrow-functions.php", FileMetric.functions, 8);
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric(
                phpTestResourcesPath + "empty-last-line.php",
                FileMetric.linesOfCode,
                66,
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(
                phpTestResourcesPath + "php-example-code.php",
                FileMetric.linesOfCode,
                65,
            );
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(phpTestResourcesPath + "empty.php", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(phpTestResourcesPath + "one-line.php", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(phpTestResourcesPath + "line-break.php", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                phpTestResourcesPath + "php-example-code.php",
                FileMetric.realLinesOfCode,
                43,
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(phpTestResourcesPath + "empty.php", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric(
                phpTestResourcesPath + "same-line-comment.php",
                FileMetric.realLinesOfCode,
                11,
            );
        });
    });

    describe("parses PHP commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets and comment " +
                "lines inside block comment",
            () => {
                testFileMetric(
                    phpTestResourcesPath + "php-example-code.php",
                    FileMetric.commentLines,
                    12,
                );
            },
        );
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const couplingResult = await getCouplingMetrics(
                phpTestResourcesPath + "coupling-examples/",
            );

            expect(couplingResult).toMatchSnapshot();
        });
    });
});
