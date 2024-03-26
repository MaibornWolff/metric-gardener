import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Go metric tests", () => {
    const goTestResourcesPath = "./resources/go/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, goTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(goTestResourcesPath);
    });

    describe("parses Go Complexity metric", () => {
        it("should count if statements correctly", () => {
            testFileMetric("if-statements.go", FileMetric.complexity, 7);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.go", FileMetric.complexity, 2);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.go", FileMetric.complexity, 3);
        });

        it("should not count any struct or interface declarations", () => {
            testFileMetric("structs-interfaces.go", FileMetric.complexity, 5);
        });

        it("should count case statements correctly", () => {
            testFileMetric("case-statements.go", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly", () => {
            testFileMetric("throw-try-catch-finally.go", FileMetric.complexity, 0);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.go", FileMetric.complexity, 4);
        });
    });

    describe("parses Go functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.go", FileMetric.functions, 2);
        });
    });

    describe("parses Go classes metric", () => {
        it("should count structs and interfaces for the classes metric", () => {
            testFileMetric("structs-interfaces.go", FileMetric.classes, 3);
        });
    });

    describe("parses Go commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            () => {
                testFileMetric("if-statements.go", FileMetric.commentLines, 6);
            },
        );

        it("should count number of comment lines correctly, including multiple successive comments", () => {
            testFileMetric("go-example-code.go", FileMetric.commentLines, 9);
        });
    });

    describe("parses Go lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("empty-last-line.go", FileMetric.linesOfCode, 54);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("go-example-code.go", FileMetric.linesOfCode, 53);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.go", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.go", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", () => {
            testFileMetric("go-example-code.go", FileMetric.realLinesOfCode, 32);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.go", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment that includes code", () => {
            testFileMetric("if-statements.go", FileMetric.realLinesOfCode, 19);
        });
    });
});
