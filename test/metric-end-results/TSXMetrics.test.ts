import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("TSX metrics tests.", () => {
    const tsxTestResourcesPath = "./resources/tsx/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(tsxTestResourcesPath);
    });

    describe("parses classes metric", () => {
        it("should count all classes, interfaces, enums and object types with a type name.", () => {
            testFileMetric(tsxTestResourcesPath + "/class-likes.tsx", FileMetric.classes, 8);
        });
    });

    describe("parses functions metric", () => {
        it("should count all function declarations and lambda expressions.", () => {
            testFileMetric(tsxTestResourcesPath + "/functions.tsx", FileMetric.functions, 8);
        });
    });

    describe("parses complexity metric", () => {
        it("should count all if, if-else, for, while and do-while statements.", () => {
            testFileMetric(tsxTestResourcesPath + "/branches_loops.tsx", FileMetric.complexity, 9);
        });
        it("should count the ternary expression.", () => {
            testFileMetric(tsxTestResourcesPath + "/ternary.tsx", FileMetric.complexity, 2);
        });
    });

    describe("parses comment lines metric", () => {
        it("should count all multiline, one-line and inline comments.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.commentLines, 6);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count comments and empty lines.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.realLinesOfCode, 16);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count all lines in file.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.linesOfCode, 22);
        });
    });
});
