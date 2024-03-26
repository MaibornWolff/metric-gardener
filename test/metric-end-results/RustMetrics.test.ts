import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Rust metrics tests", () => {
    const rsTestResourcesPath = "./resources/rust/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, rsTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(rsTestResourcesPath);
    });

    describe("parses Rust Complexity metric", () => {
        it("should calculate complexity correctly", () => {
            testFileMetric("rust-example-code.rs", FileMetric.complexity, 21);
        });
    });

    describe("parses Rust classes metric", () => {
        it("should count struct and trait declarations as classes", () => {
            testFileMetric("rust-example-code.rs", FileMetric.classes, 2);
        });
    });

    describe("parses Rust functions metric", () => {
        it("should count function declarations correctly", () => {
            testFileMetric("rust-example-code.rs", FileMetric.functions, 6);
        });
    });

    describe("parses Rust comment lines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("rust-example-code.rs", FileMetric.commentLines, 20);
        });

        it("should count all different kinds of comment lines correctly", () => {
            testFileMetric("comments.rs", FileMetric.commentLines, 32);
        });
    });

    describe("parses Rust lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file", () => {
            testFileMetric("rust-example-code.rs", FileMetric.linesOfCode, 105);
        });
    });

    describe("parses Rust real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("rust-example-code.rs", FileMetric.realLinesOfCode, 70);
        });
    });
});
