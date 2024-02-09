import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    describe("parses Python Complexity metric", () => {
        it("should count loops properly", async () => {
            await testFileMetric(pythonTestResourcesPath + "loops.py", FileMetric.complexity, 4);
        });

        it("should count if statements correctly", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "if-statements.py",
                FileMetric.complexity,
                6
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetric(pythonTestResourcesPath + "classes.py", FileMetric.complexity, 1);
        });

        it.skip("should count case but no default statements correctly", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "case-statements.py",
                FileMetric.complexity,
                3
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "functions-and-methods.py",
                FileMetric.complexity,
                6
            );
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "multiple-return-statements.py",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "throw-try-catch-finally.py",
                FileMetric.complexity,
                2
            );
        });
    });

    describe("parses Python classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetric(pythonTestResourcesPath + "classes.py", FileMetric.classes, 4);
        });
    });

    describe("parses Python functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "functions-and-methods.py",
                FileMetric.functions,
                6
            );
        });
    });

    describe("parses Python comment lines metric", () => {
        it("should count correctly, including inline and block comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.commentLines,
                7
            );
        });

        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "comments.py",
                FileMetric.commentLines,
                11
            );
        });
    });

    describe("parses Python lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "classes.py",
                FileMetric.linesOfCode,
                19
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetric(pythonTestResourcesPath + "empty.py", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "one-line.py",
                FileMetric.linesOfCode,
                1
            );
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "line-break.py",
                FileMetric.linesOfCode,
                2
            );
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "blocks.py",
                FileMetric.realLinesOfCode,
                9
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "empty.py",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly for a non-empty file with nested loops and comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "loops.py",
                FileMetric.realLinesOfCode,
                8
            );
        });

        it("should count correctly in the presence of block comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.realLinesOfCode,
                3
            );
        });
    });
});
