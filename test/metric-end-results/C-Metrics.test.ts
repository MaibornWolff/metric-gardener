import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C metrics tests", () => {
    const cTestResourcesPath = "./resources/c/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, cTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(cTestResourcesPath, true);
    });

    describe("Parsing the C complexity metric", () => {
        it("should be correct for a source code file", () => {
            testFileMetric("c-example-code.c", FileMetric.complexity, 14);
        });

        it("should be correct for a header file", () => {
            testFileMetric("c-example-header.h", FileMetric.complexity, 1);
        });

        it("should count the SEH except clause", () => {
            testFileMetric("seh_except.c", FileMetric.complexity, 2);
        });
    });

    describe("Parsing the C classes metric", () => {
        it("should return zero for a source code file without any structs, enums or unions", () => {
            testFileMetric("c-example-code.c", FileMetric.classes, 0);
        });

        it("should be correct for a header file with structs, enums or unions", () => {
            testFileMetric("c-example-header.h", FileMetric.classes, 9);
        });
    });

    describe("Parsing the C functions metric", () => {
        it("should count function definitions", () => {
            testFileMetric("c-example-code.c", FileMetric.functions, 2);
        });

        it("should count function declarations", () => {
            testFileMetric("c-example-header.h", FileMetric.functions, 1);
        });
    });

    describe("Parsing the C comment lines metric", () => {
        it("should return zero for a source code file without any comments", () => {
            testFileMetric("c-example-code.c", FileMetric.commentLines, 0);
        });

        it("should count block comments and C++ style inline comments correctly", () => {
            testFileMetric("c-example-header.h", FileMetric.commentLines, 17);
        });
    });

    describe("Parsing the C lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty source code file", () => {
            testFileMetric("c-example-code.c", FileMetric.linesOfCode, 58);
        });

        it("should count the lines of code correctly for a non-empty header file", () => {
            testFileMetric("c-example-header.h", FileMetric.linesOfCode, 72);
        });

        it("should count one line for an empty file", () => {
            testFileMetric("empty.c", FileMetric.linesOfCode, 1);
        });
    });

    describe("Parsing the C real lines of code metric", () => {
        it("should count correctly for a source code file", () => {
            testFileMetric("c-example-code.c", FileMetric.realLinesOfCode, 49);
        });

        it("should count correctly for a non-empty header file, ignoring comments and empty lines", () => {
            testFileMetric("c-example-header.h", FileMetric.realLinesOfCode, 39);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.c", FileMetric.realLinesOfCode, 0);
        });
    });
});
