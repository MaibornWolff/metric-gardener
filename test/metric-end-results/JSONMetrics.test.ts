import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("JSON metrics tests", () => {
    const jsonTestResourcesPath = "./resources/json/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, jsonTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(jsonTestResourcesPath);
    });

    describe("parses JSON nesting level metric", () => {
        it("should calculate the maximum nesting level", () => {
            testFileMetric("example.json", FileMetric.maxNestingLevel, 2);
        });

        it("should also calculate the maximum nesting level", () => {
            testFileMetric("example2.json", FileMetric.maxNestingLevel, 3);
        });

        it("should correctly calculate the maximum nesting level for a deeply nested JSON file", () => {
            testFileMetric("deep.json", FileMetric.maxNestingLevel, 12);
        });

        it("should correctly calculate the maximum nesting level for a unformatted JSON file", () => {
            testFileMetric("unformatted.json", FileMetric.maxNestingLevel, 3);
        });

        it("should correctly calculate the maximum nesting level for a JSON file with one non-empty line", () => {
            testFileMetric("one-line.json", FileMetric.maxNestingLevel, 0);
        });

        it("should correctly calculate the maximum nesting level for an empty JSON file", () => {
            testFileMetric("empty.json", FileMetric.maxNestingLevel, 0);
        });
    });
});
