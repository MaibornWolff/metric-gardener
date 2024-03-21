import { expectFileMetric, getTestConfiguration } from "./TestHelper";
import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { CouplingResult, FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("Test for handling unsupported files, with unknown or no file extension", () => {
    const unsupportedTestResourcesPath = "./resources/unsupported/";

    let results: {
        fileMetrics: Map<string, FileMetricResults>;
        unsupportedFiles: string[];
        errorFiles: string[];
        couplingMetrics: CouplingResult;
    };

    function testFileMetric(inputPath: string, metric: FileMetric, expected: number) {
        expectFileMetric(results.fileMetrics, inputPath, metric, expected);
    }

    beforeAll(async () => {
        const realInputPath = fs.realpathSync(unsupportedTestResourcesPath);
        const parser = new GenericParser(getTestConfiguration(realInputPath));
        results = await parser.calculateMetrics();
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension as unsupported files", () => {
            const filePath = fs.realpathSync(
                unsupportedTestResourcesPath + "example.unknownExtension",
            );
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension as unsupported files", () => {
            const filePath = fs.realpathSync(
                unsupportedTestResourcesPath + "ExampleWithoutExtension",
            );
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should calculate lines of code for files with unknown file extension", () => {
            testFileMetric(
                unsupportedTestResourcesPath + "example.unknownExtension",
                FileMetric.linesOfCode,
                5,
            );
        });

        it("should calculate lines of code for files with no file extension", () => {
            testFileMetric(
                unsupportedTestResourcesPath + "ExampleWithoutExtension",
                FileMetric.linesOfCode,
                6,
            );
        });

        it("should calculate lines of code for an empty, unsupported file", () => {
            testFileMetric(unsupportedTestResourcesPath + "empty", FileMetric.linesOfCode, 1);
        });

        it("should still list files with known extension", () => {
            const filePath = fs.realpathSync(unsupportedTestResourcesPath + "known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
