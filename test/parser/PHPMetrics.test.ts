import { getCouplingMetrics, testFileMetrics } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("PHP metrics tests", () => {
    const phpTestResourcesPath = "./resources/php/";

    describe("parses PHP Complexity metric", () => {
        it("should count branching statements correctly", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "if-statements.php",
                FileMetric.complexity,
                8
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "functions-and-methods.php",
                FileMetric.complexity,
                7
            );
        });

        it("should not count multiple return statements within functions and methods like sonar", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "multiple-return-statements.php",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(phpTestResourcesPath + "classes.php", FileMetric.complexity, 0);
        });

        it("should count case statements correctly", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "case-statements.php",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "throw-try-catch-finally.php",
                FileMetric.complexity,
                2
            );
        });

        it("should count loops properly", async () => {
            await testFileMetrics(phpTestResourcesPath + "loops.php", FileMetric.complexity, 4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetrics(phpTestResourcesPath + "classes.php", FileMetric.classes, 3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "functions-and-methods.php",
                FileMetric.functions,
                7
            );
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "empty-last-line.php",
                FileMetric.linesOfCode,
                66
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "php-example-code.php",
                FileMetric.linesOfCode,
                65
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(phpTestResourcesPath + "empty.php", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(phpTestResourcesPath + "one-line.php", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "line-break.php",
                FileMetric.linesOfCode,
                2
            );
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "php-example-code.php",
                FileMetric.realLinesOfCode,
                43
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "empty.php",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "same-line-comment.php",
                FileMetric.realLinesOfCode,
                11
            );
        });
    });

    describe("parses PHP commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets and comment " +
                "lines inside block comment",
            async () => {
                await testFileMetrics(
                    phpTestResourcesPath + "php-example-code.php",
                    FileMetric.commentLines,
                    12
                );
            }
        );
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const couplingResult = await getCouplingMetrics(
                phpTestResourcesPath + "coupling-examples/"
            );

            expect(couplingResult).toMatchSnapshot();
        });
    });
});
