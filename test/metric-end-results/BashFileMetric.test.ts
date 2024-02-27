import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("Bash metrics tests", () => {
    const bashTestResourcesPath = "./resources/bash/";
    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(bashTestResourcesPath);
    });

    describe("parses functions metric", () => {
        it("should count all function declarations ", () => {
            testFileMetric(bashTestResourcesPath + "/functions.sh", FileMetric.functions, 7);
        });
    });
    describe("parses complexity metric", () => {
        it("should counts all if and elif labels", () => {
            testFileMetric(bashTestResourcesPath + "/if-statement.sh", FileMetric.complexity, 8);
        });
        it("should counts all ternary expression", () => {
            testFileMetric(bashTestResourcesPath + "/ternary.sh", FileMetric.complexity, 1);
        });
        it("should counts all binary logical operators (&& and ||)", () => {
            testFileMetric(bashTestResourcesPath + "/and_or.sh", FileMetric.complexity, 15);
        });
        it("should counts all for loops", () => {
            testFileMetric(bashTestResourcesPath + "/for_loops.sh", FileMetric.complexity, 4);
        });
        it("should counts all while loops", () => {
            testFileMetric(bashTestResourcesPath + "/while_loops.sh", FileMetric.complexity, 4);
        });
        it("should counts all until loops", () => {
            testFileMetric(bashTestResourcesPath + "/until_loops.sh", FileMetric.complexity, 4);
        });
        it("should counts all case items (incl. default case) in case-statement", () => {
            testFileMetric(bashTestResourcesPath + "/case_item.sh", FileMetric.complexity, 4);
        });
    });
    describe("parses real_lines_of_code metric", () => {
        it("should also count multiline commands ", () => {
            testFileMetric(
                bashTestResourcesPath + "/multiline_command.sh",
                FileMetric.realLinesOfCode,
                11
            );
        });
        it("should count 0 line for empty file ", () => {
            testFileMetric(bashTestResourcesPath + "/empty.sh", FileMetric.realLinesOfCode, 0);
        });
        it("should count multiline heredocs and no-op command (NOP), but no real comments (start with #)", () => {
            testFileMetric(
                bashTestResourcesPath + "/heredoc_NOP.sh",
                FileMetric.realLinesOfCode,
                23
            );
        });
        it("should count real lines of code correctly for heredoc code", () => {
            testFileMetric(
                bashTestResourcesPath + "/rloc_heredoc.sh",
                FileMetric.realLinesOfCode,
                16
            );
        });
    });
    describe("parses lines_of_code metric", () => {
        it("should count 1 line of code for empty file ", () => {
            testFileMetric(bashTestResourcesPath + "/empty.sh", FileMetric.linesOfCode, 1);
        });
        it("should count all lines in file ", () => {
            testFileMetric(bashTestResourcesPath + "/complexBash.sh", FileMetric.linesOfCode, 76);
        });
    });
    describe("parses comments metric", () => {
        it("should count all lines with comment, but not heredoc or string", () => {
            testFileMetric(bashTestResourcesPath + "/comment.sh", FileMetric.commentLines, 9);
        });
    });
});
