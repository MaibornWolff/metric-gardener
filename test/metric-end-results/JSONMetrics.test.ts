import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("JSON metrics tests", () => {
    const jsonTestResourcesPath = "./resources/json/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(jsonTestResourcesPath);
    });

    describe("parses JSON nesting level metric", () => {
        it("should calculate nesting level", () => {
            testFileMetric(jsonTestResourcesPath + "example.json", FileMetric.maxNestingLevel, 2);
        });

        it("should also calculate nesting level", () => {
            testFileMetric(jsonTestResourcesPath + "example2.json", FileMetric.maxNestingLevel, 3);
        });

        it("should correctly calculate the nesting level for a deep nested JSON file", () => {
            testFileMetric(jsonTestResourcesPath + "deep.json", FileMetric.maxNestingLevel, 12);
        });

        it("should correctly calculate the nesting level for a unformatted JSON file", () => {
            testFileMetric(
                jsonTestResourcesPath + "unformatted.json",
                FileMetric.maxNestingLevel,
                3,
            );
        });

        it("should correctly calculate the nesting level for an empty JSON file", () => {
            testFileMetric(jsonTestResourcesPath + "empty.json", FileMetric.maxNestingLevel, 0);
        });
    });
});