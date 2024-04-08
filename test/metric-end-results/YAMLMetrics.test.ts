import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("YAML metrics tests", () => {
    const yamlTestResourcesPath = "./resources/yaml/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, yamlTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(yamlTestResourcesPath);
    });

    describe("parses YAML nesting level metric", () => {
        it("should calculate nesting level", () => {
            testFileMetric("example.yaml", "max_nesting_level", 3);
        });

        it("should correctly calculate nesting level of a more complex yaml", () => {
            testFileMetric("tests.yml", "max_nesting_level", 6);
        });

        it("should correctly calculate nesting level of a yaml file with only one line", () => {
            testFileMetric("one-line.yaml", "max_nesting_level", 0);
        });

        it("should correctly calculate nesting level of a yaml file with only one non-empty line", () => {
            testFileMetric("one-line.yaml", "max_nesting_level", 0);
        });

        it("should correctly calculate nesting level of an empty yaml file", () => {
            testFileMetric("empty.yml", "max_nesting_level", 0);
        });
    });
});
