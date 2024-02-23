import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("Go metric tests", () => {
    const goTestResourcesPath = "./resources/go/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(goTestResourcesPath);
    });

    describe("parses Go Complexity metric", () => {
        it("should count if statements correctly", () => {
            testFileMetric(goTestResourcesPath + "if-statements.go", FileMetric.complexity, 7);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric(
                goTestResourcesPath + "functions-and-methods.go",
                FileMetric.complexity,
                2
            );
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric(
                goTestResourcesPath + "multiple-return-statements.go",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any struct or interface declarations", () => {
            testFileMetric(goTestResourcesPath + "structs-interfaces.go", FileMetric.complexity, 5);
        });

        it("should count case statements correctly", () => {
            testFileMetric(goTestResourcesPath + "case-statements.go", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly", () => {
            testFileMetric(
                goTestResourcesPath + "throw-try-catch-finally.go",
                FileMetric.complexity,
                0
            );
        });

        it("should count loops properly", () => {
            testFileMetric(goTestResourcesPath + "loops.go", FileMetric.complexity, 4);
        });
    });

    describe("parses Go functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric(
                goTestResourcesPath + "functions-and-methods.go",
                FileMetric.functions,
                2
            );
        });
    });

    describe("parses Go classes metric", () => {
        it("should count structs and interfaces for the classes metric", () => {
            testFileMetric(goTestResourcesPath + "structs-interfaces.go", FileMetric.classes, 3);
        });
    });

    describe("parses Go commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            () => {
                testFileMetric(
                    goTestResourcesPath + "if-statements.go",
                    FileMetric.commentLines,
                    6
                );
            }
        );

        it("should count number of comment lines correctly, including multiple successive comments", () => {
            testFileMetric(goTestResourcesPath + "go-example-code.go", FileMetric.commentLines, 9);
        });
    });

    describe("parses Go lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric(goTestResourcesPath + "empty-last-line.go", FileMetric.linesOfCode, 54);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(goTestResourcesPath + "go-example-code.go", FileMetric.linesOfCode, 53);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(goTestResourcesPath + "empty.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(goTestResourcesPath + "one-line.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(goTestResourcesPath + "line-break.go", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", () => {
            testFileMetric(
                goTestResourcesPath + "go-example-code.go",
                FileMetric.realLinesOfCode,
                32
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(goTestResourcesPath + "empty.go", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment that includes code", () => {
            testFileMetric(
                goTestResourcesPath + "if-statements.go",
                FileMetric.realLinesOfCode,
                19
            );
        });
    });
});
