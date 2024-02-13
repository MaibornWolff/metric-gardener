import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(pythonTestResourcesPath);
    });

    describe("parses Python Complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric(pythonTestResourcesPath + "loops.py", FileMetric.complexity, 4);
        });

        it("should count if statements correctly", () => {
            testFileMetric(pythonTestResourcesPath + "if-statements.py", FileMetric.complexity, 6);
        });

        it("should not count any class declaration", () => {
            testFileMetric(pythonTestResourcesPath + "classes.py", FileMetric.complexity, 1);
        });

        it("should count switch case labels, but no default labels", () => {
            testFileMetric(
                pythonTestResourcesPath + "case-statements.py",
                FileMetric.complexity,
                3
            );
        });

        it("should count functions and methods correctly", () => {
            testFileMetric(
                pythonTestResourcesPath + "functions-and-methods.py",
                FileMetric.complexity,
                6
            );
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric(
                pythonTestResourcesPath + "multiple-return-statements.py",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric(
                pythonTestResourcesPath + "throw-try-catch-finally.py",
                FileMetric.complexity,
                2
            );
        });
    });

    describe("parses Python classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(pythonTestResourcesPath + "classes.py", FileMetric.classes, 4);
        });
    });

    describe("parses Python functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric(
                pythonTestResourcesPath + "functions-and-methods.py",
                FileMetric.functions,
                6
            );
        });
    });

    describe("parses Python comment lines metric", () => {
        it("should count correctly, including inline and block comments", () => {
            testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.commentLines,
                7
            );
        });

        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric(pythonTestResourcesPath + "comments.py", FileMetric.commentLines, 11);
        });
    });

    describe("parses Python lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(pythonTestResourcesPath + "classes.py", FileMetric.linesOfCode, 19);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(pythonTestResourcesPath + "empty.py", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(pythonTestResourcesPath + "one-line.py", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(pythonTestResourcesPath + "line-break.py", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", () => {
            testFileMetric(pythonTestResourcesPath + "blocks.py", FileMetric.realLinesOfCode, 9);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(pythonTestResourcesPath + "empty.py", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a non-empty file with nested loops and comments", () => {
            testFileMetric(pythonTestResourcesPath + "loops.py", FileMetric.realLinesOfCode, 8);
        });

        it("should count correctly in the presence of block comments", () => {
            testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.realLinesOfCode,
                3
            );
        });
    });
});
