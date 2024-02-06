import { expectFileMetric, getParserConfiguration, testFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";
import { GenericParser } from "../../src/parser/GenericParser";
import fs from "fs";

describe("C++ metrics tests", () => {
    const cppTestResourcesPath = "./resources/c++/";

    let results: Map<string, Map<string, MetricResult>>;

    beforeAll(async () => {
        const realInputPath = fs.realpathSync(cppTestResourcesPath);
        const parser = new GenericParser(getParserConfiguration(realInputPath));
        results = (await parser.calculateMetrics()).fileMetrics;
    });

    describe("parses C++ real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            expectFileMetric(
                results,
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.realLinesOfCode,
                46
            );
        });

        it("should count correctly for an empty file", () => {
            expectFileMetric(
                results,
                cppTestResourcesPath + "empty.cpp",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly for a header file", () => {
            expectFileMetric(
                results,
                cppTestResourcesPath + "cpp_example_header.hpp",
                FileMetric.realLinesOfCode,
                30
            );
        });

        it("should count correctly if there are comments in the same line as actual code", () => {
            expectFileMetric(
                results,
                cppTestResourcesPath + "same_line_comment.cpp",
                FileMetric.realLinesOfCode,
                4
            );
        });
    });
});
