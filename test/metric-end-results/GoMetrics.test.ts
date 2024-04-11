import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Go metric tests", () => {
    const goTestResourcesPath = "./resources/go/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, goTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(goTestResourcesPath);
    });

    describe("parses Go Complexity metric", () => {
        it("should count if statements correctly", () => {
            testFileMetric("if-statements.go", "complexity", 7);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.go", "complexity", 2);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.go", "complexity", 3);
        });

        it("should not count any struct or interface declarations", () => {
            testFileMetric("structs-interfaces.go", "complexity", 5);
        });

        it("should count case statements correctly", () => {
            testFileMetric("case-statements.go", "complexity", 3);
        });

        it("should count try-catch-finally properly", () => {
            testFileMetric("throw-try-catch-finally.go", "complexity", 0);
        });

        it("should count loops properly", () => {
            testFileMetric("loops.go", "complexity", 4);
        });
    });

    describe("parses Go functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.go", "functions", 2);
        });
    });

    describe("parses Go classes metric", () => {
        it("should count structs and interfaces for the classes metric", () => {
            testFileMetric("structs-interfaces.go", "classes", 3);
        });
    });

    describe("parses Go commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            () => {
                testFileMetric("if-statements.go", "comment_lines", 6);
            },
        );

        it("should count number of comment lines correctly, including multiple successive comments", () => {
            testFileMetric("go-example-code.go", "comment_lines", 9);
        });
    });

    describe("parses Go lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("empty-last-line.go", "lines_of_code", 54);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("go-example-code.go", "lines_of_code", 53);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.go", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.go", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.go", "lines_of_code", 2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", () => {
            testFileMetric("go-example-code.go", "real_lines_of_code", 32);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.go", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment that includes code", () => {
            testFileMetric("if-statements.go", "real_lines_of_code", 19);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.go", FileMetric.keywordsInComments, 8);
        });
    });
});
