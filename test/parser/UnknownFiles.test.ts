import {
    expectFileMetric,
    getFileMetrics,
    getParserConfiguration,
    parseAllFileMetrics,
} from "./TestHelper";
import fs from "fs";
import { MetricResult } from "../../src/parser/metrics/Metric";
import { GenericParser } from "../../src/parser/GenericParser";

describe("Test for handling files with unknown or no file extension", () => {
    const unknownTestResourcesPath = "./resources/unknown/";

    let results;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        const realInputPath = fs.realpathSync(unknownTestResourcesPath);
        const parser = new GenericParser(getParserConfiguration(realInputPath));
        results = await parser.calculateMetrics();
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "example.unknownExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "ExampleWithoutExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should still list files with known extension", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
