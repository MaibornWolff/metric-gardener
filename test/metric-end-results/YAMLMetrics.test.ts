import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("YAML metrics tests", () => {
    const yamlTestResourcesPath = "./resources/yaml/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, yamlTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(yamlTestResourcesPath);
    });

    describe("parses YAML nesting level metric", () => {
        it("should calculate nesting level", () => {
            testFileMetric("example.yaml", FileMetric.maxNestingLevel, 3);
        });

        it("should correctly calculate nesting level of a more complex yaml", () => {
            testFileMetric("tests.yml", FileMetric.maxNestingLevel, 6);
        });

        it("should correctly calculate nesting level of a yaml file with only one line", () => {
            testFileMetric("one-line.yaml", FileMetric.maxNestingLevel, 0);
        });

        it("should correctly calculate nesting level of a yaml file with only one non-empty line", () => {
            testFileMetric("one-line.yaml", FileMetric.maxNestingLevel, 0);
        });

        it("should correctly calculate nesting level of an empty yaml file", () => {
            testFileMetric("empty.yml", FileMetric.maxNestingLevel, 0);
        });
    });
});
