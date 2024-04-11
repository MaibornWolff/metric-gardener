import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C metrics tests", () => {
    const cTestResourcesPath = "./resources/c/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, cTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(cTestResourcesPath, true);
    });

    describe("Parsing the C complexity metric", () => {
        it("should be correct for a source code file", () => {
            testFileMetric("c-example-code.c", "complexity", 14);
        });

        it("should be correct for a header file", () => {
            testFileMetric("c-example-header.h", "complexity", 1);
        });

        it("should count the SEH except clause", () => {
            testFileMetric("seh_except.c", "complexity", 2);
        });
    });

    describe("Parsing the C classes metric", () => {
        it("should return zero for a source code file without any structs, enums or unions", () => {
            testFileMetric("c-example-code.c", "classes", 0);
        });

        it("should be correct for a header file with structs, enums or unions", () => {
            testFileMetric("c-example-header.h", "classes", 9);
        });
    });

    describe("Parsing the C functions metric", () => {
        it("should count function definitions", () => {
            testFileMetric("c-example-code.c", "functions", 2);
        });

        it("should count function declarations", () => {
            testFileMetric("c-example-header.h", "functions", 1);
        });
    });

    describe("Parsing the C comment lines metric", () => {
        it("should return zero for a source code file without any comments", () => {
            testFileMetric("c-example-code.c", "comment_lines", 0);
        });

        it("should count block comments and C++ style inline comments correctly", () => {
            testFileMetric("c-example-header.h", "comment_lines", 17);
        });
    });

    describe("Parsing the C lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty source code file", () => {
            testFileMetric("c-example-code.c", "lines_of_code", 58);
        });

        it("should count the lines of code correctly for a non-empty header file", () => {
            testFileMetric("c-example-header.h", "lines_of_code", 72);
        });

        it("should count one line for an empty file", () => {
            testFileMetric("empty.c", "lines_of_code", 1);
        });
    });

    describe("Parsing the C real lines of code metric", () => {
        it("should count correctly for a source code file", () => {
            testFileMetric("c-example-code.c", "real_lines_of_code", 49);
        });

        it("should count correctly for a non-empty header file, ignoring comments and empty lines", () => {
            testFileMetric("c-example-header.h", "real_lines_of_code", 39);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.c", "real_lines_of_code", 0);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.c", "keywords_in_comments", 8);
        });
    });
});
