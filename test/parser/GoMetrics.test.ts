import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("Go metric tests", () => {
    const goTestResourcesPath = "./resources/go/";

    describe("parses Go Complexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetric(
                goTestResourcesPath + "if-statements.go",
                FileMetric.complexity,
                7
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetric(
                goTestResourcesPath + "functions-and-methods.go",
                FileMetric.complexity,
                2
            );
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetric(
                goTestResourcesPath + "multiple-return-statements.go",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetric(goTestResourcesPath + "classes.go", FileMetric.complexity, 0);
        });

        it("should count case statements correctly", async () => {
            await testFileMetric(
                goTestResourcesPath + "case-statements.go",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetric(
                goTestResourcesPath + "throw-try-catch-finally.go",
                FileMetric.complexity,
                0
            );
        });

        it("should count loops properly", async () => {
            await testFileMetric(goTestResourcesPath + "loops.go", FileMetric.complexity, 4);
        });
    });

    describe("parses Go functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetric(
                goTestResourcesPath + "functions-and-methods.go",
                FileMetric.functions,
                2
            );
        });
    });

    describe("parses Go commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            async () => {
                await testFileMetric(
                    goTestResourcesPath + "if-statements.go",
                    FileMetric.commentLines,
                    6
                );
            }
        );

        it("should count number of comment lines correctly, including multiple successive comments", async () => {
            await testFileMetric(
                goTestResourcesPath + "go-example-code.go",
                FileMetric.commentLines,
                9
            );
        });
    });

    describe("parses Go lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetric(
                goTestResourcesPath + "empty-last-line.go",
                FileMetric.linesOfCode,
                54
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetric(
                goTestResourcesPath + "go-example-code.go",
                FileMetric.linesOfCode,
                53
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetric(goTestResourcesPath + "empty.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetric(goTestResourcesPath + "one-line.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetric(goTestResourcesPath + "line-break.go", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", async () => {
            await testFileMetric(
                goTestResourcesPath + "go-example-code.go",
                FileMetric.realLinesOfCode,
                32
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(goTestResourcesPath + "empty.go", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment that includes code", async () => {
            await testFileMetric(
                goTestResourcesPath + "if-statements.go",
                FileMetric.realLinesOfCode,
                19
            );
        });
    });
});
