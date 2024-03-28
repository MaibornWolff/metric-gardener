import { beforeAll, describe, expect, it } from "vitest";
import { expectFileMetric, getTestConfiguration, mockConsole } from "./TestHelper.js";
import * as fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser.js";
import { CouplingResult, FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Test for handling unsupported files, with unknown or no file extension", () => {
    const unsupportedTestResourcesPath = "./resources/unsupported/";

    let results: {
        fileMetrics: Map<string, FileMetricResults>;
        unsupportedFiles: string[];
        errorFiles: string[];
        couplingMetrics: CouplingResult;
    };

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(
            results.fileMetrics,
            unsupportedTestResourcesPath + path,
            metric,
            expected,
        );
    }

    function getRealpath(path: string) {
        return fs.realpathSync(unsupportedTestResourcesPath + path);
    }

    beforeAll(async () => {
        mockConsole();
        const realInputPath = fs.realpathSync(unsupportedTestResourcesPath);
        const parser = new GenericParser(getTestConfiguration(realInputPath));
        results = await parser.calculateMetrics();
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension as unsupported files", async () => {
            const filePath = getRealpath("example.unknownExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension as unsupported files", async () => {
            const filePath = getRealpath("ExampleWithoutExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should calculate lines of code for files with unknown file extension", async () => {
            testFileMetric("example.unknownExtension", FileMetric.linesOfCode, 5);
        });

        it("should calculate lines of code for files with no file extension", async () => {
            testFileMetric("ExampleWithoutExtension", FileMetric.linesOfCode, 6);
        });

        it("should calculate lines of code for an empty, unsupported file", async () => {
            testFileMetric("empty", FileMetric.linesOfCode, 1);
        });

        it("should still list files with known extension", async () => {
            const filePath = getRealpath("known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
