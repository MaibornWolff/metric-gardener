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
            testFileMetric(yamlTestResourcesPath + "example.yaml", FileMetric.nestingLevel, 4);
        });
    });
});
