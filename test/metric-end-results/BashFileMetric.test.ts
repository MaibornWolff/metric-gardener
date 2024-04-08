import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Bash metrics tests", () => {
    const bashTestResourcesPath = "./resources/bash/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, bashTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(bashTestResourcesPath);
    });

    describe("parses functions metric", () => {
        it("should count all function declarations ", () => {
            testFileMetric("functions.sh", "functions", 7);
        });
    });

    describe("parses complexity metric", () => {
        it("should counts all if and elif labels", () => {
            testFileMetric("if-statement.sh", "complexity", 8);
        });

        it("should counts all ternary expression", () => {
            testFileMetric("ternary.sh", "complexity", 1);
        });

        it("should counts all binary logical operators (&& and ||)", () => {
            testFileMetric("and_or.sh", "complexity", 15);
        });

        it("should counts all for loops", () => {
            testFileMetric("for_loops.sh", "complexity", 4);
        });

        it("should counts all while loops", () => {
            testFileMetric("while_loops.sh", "complexity", 4);
        });

        it("should counts all until loops", () => {
            testFileMetric("until_loops.sh", "complexity", 4);
        });

        it("should counts all case items (incl. default case) in case-statement", () => {
            testFileMetric("case_item.sh", "complexity", 4);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should also count multiline commands ", () => {
            testFileMetric("multiline_command.sh", "real_lines_of_code", 11);
        });

        it("should count 0 lines for empty file ", () => {
            testFileMetric("empty.sh", "real_lines_of_code", 0);
        });

        it("should count multiline heredocs and no-op command (NOP), but no real comments (start with #)", () => {
            testFileMetric("heredoc_NOP.sh", "real_lines_of_code", 26);
        });

        it("should count real lines of code correctly for heredoc code", () => {
            testFileMetric("rloc_heredoc.sh", "real_lines_of_code", 16);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count 1 line of code for empty file ", () => {
            testFileMetric("empty.sh", "lines_of_code", 1);
        });

        it("should count all lines in file ", () => {
            testFileMetric("complexBash.sh", "lines_of_code", 75);
        });
    });

    describe("parses comments metric", () => {
        it("should count all lines with comment, but not heredoc or string", () => {
            testFileMetric("comment.sh", "comment_lines", 9);
        });
    });
});
