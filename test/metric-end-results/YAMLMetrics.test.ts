import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("YAML metrics tests", () => {
    const yamlTestResourcesPath = "./resources/yaml/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(yamlTestResourcesPath);
    });

    describe("parses YAML nesting level metric", () => {
        it("should calculate nesting level", () => {
            testFileMetric(yamlTestResourcesPath + "example.yaml", FileMetric.maxNestingLevel, 3);
        });

        it("should correctly calculate nesting level of a more complex yaml", () => {
            testFileMetric(yamlTestResourcesPath + "tests.yml", FileMetric.maxNestingLevel, 6);
        });

        it("should correctly calculate nesting level of a yaml file with only one line", () => {
            testFileMetric(yamlTestResourcesPath + "oneline.yaml", FileMetric.maxNestingLevel, 0);
        });
    });
});
