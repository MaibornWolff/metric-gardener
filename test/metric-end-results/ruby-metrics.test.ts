import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./test-helper.js";

describe("Ruby metrics tests", () => {
    const rbTestResourcesPath = "./resources/ruby/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, rbTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(rbTestResourcesPath);
    });

    describe("parses Ruby Complexity metric", () => {
        it("should calculate complexity correctly", () => {
            testFileMetric("ruby-example-code.rb", "complexity", 16);
        });

        it("should count singleton method definitions", () => {
            testFileMetric("singleton-method.rb", "complexity", 3);
        });
    });

    describe("parses Ruby classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("ruby-example-code.rb", "classes", 1);
        });

        it("should count singleton class declarations", () => {
            testFileMetric("singleton-class.rb", "classes", 2);
        });
    });

    describe("parse Ruby functions metric", () => {
        it("should count method definitions", () => {
            testFileMetric("ruby-example-code.rb", "functions", 4);
        });

        it("should count singleton method definitions", () => {
            testFileMetric("singleton-method.rb", "functions", 3);
        });
    });

    describe("parses Ruby comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("ruby-example-code.rb", "comment_lines", 15);
        });
    });

    describe("parses Ruby lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file", () => {
            testFileMetric("ruby-example-code.rb", "lines_of_code", 91);
        });
    });

    describe("parses Ruby real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("ruby-example-code.rb", "real_lines_of_code", 62);
        });
    });
    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.rb", "keywords_in_comments", 8);
        });
    });
});
