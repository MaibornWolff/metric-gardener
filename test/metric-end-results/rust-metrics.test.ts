import { beforeAll, describe, it } from "vitest";
import { type MetricName, type FileMetricResults } from "../../src/parser/metrics/metric.js";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./test-helper.js";

describe("Rust metrics tests", () => {
    const rsTestResourcesPath = "./resources/rust/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, rsTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(rsTestResourcesPath);
    });

    describe("parses Rust Complexity metric", () => {
        it("should calculate complexity correctly", () => {
            testFileMetric("rust-example-code.rs", "complexity", 21);
        });
    });

    describe("parses Rust classes metric", () => {
        it("should count struct and trait declarations as classes", () => {
            testFileMetric("rust-example-code.rs", "classes", 2);
        });
    });

    describe("parses Rust functions metric", () => {
        it("should count function declarations correctly", () => {
            testFileMetric("rust-example-code.rs", "functions", 6);
        });
    });

    describe("parses Rust comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("rust-example-code.rs", "comment_lines", 20);
        });

        it("should count all different kinds of comment lines correctly", () => {
            testFileMetric("comments.rs", "comment_lines", 32);
        });
    });

    describe("parses Rust lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file", () => {
            testFileMetric("rust-example-code.rs", "lines_of_code", 106);
        });
    });

    describe("parses Rust real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("rust-example-code.rs", "real_lines_of_code", 70);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.rs", "keywords_in_comments", 10);
        });
    });
});
