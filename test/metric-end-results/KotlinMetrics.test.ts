import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("Kotlin metric tests", () => {
    const kotlinTestResourcesPath = "./resources/kotlin/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(kotlinTestResourcesPath);
    });

    describe("parses Kotlin complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric(kotlinTestResourcesPath + "loops.kt", FileMetric.complexity, 5);
        });

        it("should count if statements and logical operations (&& and ||) correctly", () => {
            testFileMetric(kotlinTestResourcesPath + "if-statements.kt", FileMetric.complexity, 10);
        });

        it("should not count any class declaration", () => {
            testFileMetric(kotlinTestResourcesPath + "classes.kt", FileMetric.complexity, 4);
        });

        it("should count when case statements correctly, but not else statements", async () => {
            testFileMetric(
                kotlinTestResourcesPath + "case-statements.kt",
                FileMetric.complexity,
                4
            );
        });

        it("should count all function declarations and one init block correctly", () => {
            testFileMetric(
                kotlinTestResourcesPath + "functions-and-methods.kt",
                FileMetric.complexity,
                11
            );
        });

        it("should not count multiple return statements within functions and methods", () => {
            testFileMetric(
                kotlinTestResourcesPath + "multiple-return-statements.kt",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric(
                kotlinTestResourcesPath + "throw-try-catch-finally.kt",
                FileMetric.complexity,
                3
            );
        });
    });

    describe("parses Kotlin classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(kotlinTestResourcesPath + "classes.kt", FileMetric.classes, 8);
        });
    });

    describe("parses Kotlin functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric(
                kotlinTestResourcesPath + "functions-and-methods.kt",
                FileMetric.functions,
                10
            );
        });
    });

    describe("parses Kotlin commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric(kotlinTestResourcesPath + "comments.kt", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric(
                kotlinTestResourcesPath + "same-line-comment.kt",
                FileMetric.commentLines,
                4
            );
        });
    });

    describe("parses Kotlin lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code.kt",
                FileMetric.linesOfCode,
                62
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code-2.kt",
                FileMetric.linesOfCode,
                31
            );
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(kotlinTestResourcesPath + "empty.kt", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(kotlinTestResourcesPath + "one-line.kt", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(kotlinTestResourcesPath + "line-break.kt", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Kotlin real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code.kt",
                FileMetric.realLinesOfCode,
                50
            );
        });

        it("should count correctly for a non-empty file", () => {
            testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code-2.kt",
                FileMetric.realLinesOfCode,
                31
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(kotlinTestResourcesPath + "empty.kt", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric(
                kotlinTestResourcesPath + "same-line-comment.kt",
                FileMetric.realLinesOfCode,
                5
            );
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric(
                kotlinTestResourcesPath + "weird-lines.kt",
                FileMetric.realLinesOfCode,
                30
            );
        });
    });
});
