import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("Kotlin metric tests", () => {
    const kotlinTestResourcesPath = "./resources/kotlin/";

    describe("parses Kotlin complexity metric", () => {
        it("should count loops properly", async () => {
            await testFileMetric(kotlinTestResourcesPath + "loops.kt", FileMetric.complexity, 5);
        });

        it("should count if statements and logical operations (&& and ||) correctly", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "if-statements.kt",
                FileMetric.complexity,
                10
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetric(kotlinTestResourcesPath + "classes.kt", FileMetric.complexity, 4);
        });

        it("should count when case statements correctly, but not else statements", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "case-statements.kt",
                FileMetric.complexity,
                4
            );
        });

        it("should count all function declarations and one init block correctly", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "functions-and-methods.kt",
                FileMetric.complexity,
                11
            );
        });

        it("should not count multiple return statements within functions and methods", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "multiple-return-statements.kt",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "throw-try-catch-finally.kt",
                FileMetric.complexity,
                3
            );
        });
    });

    describe("parses Kotlin classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetric(kotlinTestResourcesPath + "classes.kt", FileMetric.classes, 8);
        });
    });

    describe("parses Kotlin functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "functions-and-methods.kt",
                FileMetric.functions,
                10
            );
        });
    });

    describe("parses Kotlin commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "comments.kt",
                FileMetric.commentLines,
                14
            );
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "same-line-comment.kt",
                FileMetric.commentLines,
                4
            );
        });
    });

    describe("parses Kotlin lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code.kt",
                FileMetric.linesOfCode,
                62
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code-2.kt",
                FileMetric.linesOfCode,
                31
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetric(kotlinTestResourcesPath + "empty.kt", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "one-line.kt",
                FileMetric.linesOfCode,
                1
            );
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "line-break.kt",
                FileMetric.linesOfCode,
                2
            );
        });
    });

    describe("parses Kotlin real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code.kt",
                FileMetric.realLinesOfCode,
                50
            );
        });

        it("should count correctly for a non-empty file", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "kotlin-example-code-2.kt",
                FileMetric.realLinesOfCode,
                31
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "empty.kt",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "same-line-comment.kt",
                FileMetric.realLinesOfCode,
                5
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetric(
                kotlinTestResourcesPath + "weird-lines.kt",
                FileMetric.realLinesOfCode,
                30
            );
        });
    });
});
