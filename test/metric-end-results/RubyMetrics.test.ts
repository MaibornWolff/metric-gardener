import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("Ruby metrics tests", () => {
    const rbTestResourcesPath = "./resources/ruby/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(rbTestResourcesPath);
    });

    describe("parses Ruby Complexity metric", () => {
        it("should calculate complexity correctly", () => {
            testFileMetric(rbTestResourcesPath + "ruby-example-code.rb", FileMetric.complexity, 16);
        });

        it("should count singleton method definitions", () => {
            testFileMetric(rbTestResourcesPath + "singleton-method.rb", FileMetric.complexity, 3);
        });
    });

    describe("parses Ruby classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(rbTestResourcesPath + "ruby-example-code.rb", FileMetric.classes, 1);
        });

        it("should count singleton class declarations", () => {
            testFileMetric(rbTestResourcesPath + "singleton-class.rb", FileMetric.classes, 2);
        });
    });

    describe("parse Ruby functions metric", () => {
        it("should count method definitions", () => {
            testFileMetric(rbTestResourcesPath + "ruby-example-code.rb", FileMetric.functions, 4);
        });

        it("should count singleton method definitions", () => {
            testFileMetric(rbTestResourcesPath + "singleton-method.rb", FileMetric.functions, 3);
        });
    });

    describe("parses Ruby comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric(
                rbTestResourcesPath + "ruby-example-code.rb",
                FileMetric.commentLines,
                15,
            );
        });
    });

    describe("parses Ruby lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file", () => {
            testFileMetric(
                rbTestResourcesPath + "ruby-example-code.rb",
                FileMetric.linesOfCode,
                90,
            );
        });
    });

    describe("parses Ruby real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                rbTestResourcesPath + "ruby-example-code.rb",
                FileMetric.realLinesOfCode,
                62,
            );
        });
    });
});
