import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/Metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";

describe("JSON metrics tests", () => {
    const jsonTestResourcesPath = "./resources/json/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, jsonTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(jsonTestResourcesPath);
    });

    describe("parses JSON nesting level metric", () => {
        it("should calculate the maximum nesting level", () => {
            testFileMetric("example.json", "max_nesting_level", 2);
        });

        it("should also calculate the maximum nesting level", () => {
            testFileMetric("example2.json", "max_nesting_level", 3);
        });

        it("should correctly calculate the maximum nesting level for a deeply nested JSON file", () => {
            testFileMetric("deep.json", "max_nesting_level", 12);
        });

        it("should correctly calculate the maximum nesting level for a JSON file written in one line", () => {
            testFileMetric("one-line.json", "max_nesting_level", 3);
        });

        it("should correctly calculate the maximum nesting level for a JSON file with one empty object", () => {
            testFileMetric("empty-object.json", "max_nesting_level", 0);
        });

        it("should correctly calculate the maximum nesting level for an empty JSON file", () => {
            testFileMetric("empty.json", "max_nesting_level", 0);
        });
    });
});
