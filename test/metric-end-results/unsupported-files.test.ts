import * as fs from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { GenericParser } from "../../src/parser/generic-parser.js";
import {
    type CouplingResult,
    type MetricName,
    type FileMetricResults,
} from "../../src/parser/metrics/metric.js";
import { expectFileMetric, getTestConfiguration, mockConsole } from "./test-helper.js";

describe("Test for handling unsupported files, with unknown or no file extension", () => {
    const unsupportedTestResourcesPath = "./resources/unsupported/";

    let results: {
        fileMetrics: Map<string, FileMetricResults>;
        unsupportedFiles: string[];
        errorFiles: string[];
        couplingMetrics: CouplingResult;
    };

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(
            results.fileMetrics,
            unsupportedTestResourcesPath + path,
            metric,
            expected,
        );
    }

    function getRealpath(path: string): string {
        return fs.realpathSync(unsupportedTestResourcesPath + path);
    }

    beforeAll(async () => {
        mockConsole();
        const realInputPath = fs.realpathSync(unsupportedTestResourcesPath);
        const parser = new GenericParser(getTestConfiguration(realInputPath));
        results = await parser.calculateMetrics();
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension as unsupported files", () => {
            const filePath = getRealpath("example.unknownExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension as unsupported files", () => {
            const filePath = getRealpath("ExampleWithoutExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should calculate lines of code for files with unknown file extension", () => {
            testFileMetric("example.unknownExtension", "lines_of_code", 5);
        });

        it("should calculate lines of code for files with no file extension", () => {
            testFileMetric("ExampleWithoutExtension", "lines_of_code", 6);
        });

        it("should calculate lines of code for an empty, unsupported file", () => {
            testFileMetric("empty", "lines_of_code", 1);
        });

        it("should still list files with known extension", () => {
            const filePath = getRealpath("known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
