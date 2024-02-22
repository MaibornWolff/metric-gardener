import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("YAML metrics tests", () => {
    const yamlTestResourcesPath = "./resources/yaml/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(yamlTestResourcesPath);
    });

    describe("parses YAML nesting level metric", () => {
        it("should calculate nesting level", () => {
            testFileMetric(yamlTestResourcesPath + "example.yaml", FileMetric.nestingLevel, 3);
        });

        it("should correctly calculate nesting level of a more complex yaml", () => {
            testFileMetric(yamlTestResourcesPath + "tests.yml", FileMetric.nestingLevel, 6);
        });

        it("should correctly calculate nesting level of a yaml file with only one line", () => {
            testFileMetric(yamlTestResourcesPath + "oneline.yaml", FileMetric.nestingLevel, 0);
        });
    });
});
