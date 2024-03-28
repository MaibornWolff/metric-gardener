import { beforeAll, beforeEach, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Ruby metrics tests", () => {
    const rbTestResourcesPath = "./resources/ruby/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, rbTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(rbTestResourcesPath);
    });

    describe("parses Ruby Complexity metric", () => {
        it("should calculate complexity correctly", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.complexity, 16);
        });

        it("should count singleton method definitions", () => {
            testFileMetric("singleton-method.rb", FileMetric.complexity, 3);
        });
    });

    describe("parses Ruby classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.classes, 1);
        });

        it("should count singleton class declarations", () => {
            testFileMetric("singleton-class.rb", FileMetric.classes, 2);
        });
    });

    describe("parse Ruby functions metric", () => {
        it("should count method definitions", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.functions, 4);
        });

        it("should count singleton method definitions", () => {
            testFileMetric("singleton-method.rb", FileMetric.functions, 3);
        });
    });

    describe("parses Ruby comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.commentLines, 15);
        });
    });

    describe("parses Ruby lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.linesOfCode, 90);
        });
    });

    describe("parses Ruby real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("ruby-example-code.rb", FileMetric.realLinesOfCode, 62);
        });
    });
});
