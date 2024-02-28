import { expectFileMetric, getParserConfiguration } from "./TestHelper";
import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("Test for handling unsupported files, with unknown or no file extension", () => {
    const unknownTestResourcesPath = "./resources/unsupported/";

    let results;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results.fileMetrics, inputPath, metric, expected);

    beforeAll(async () => {
        const realInputPath = fs.realpathSync(unknownTestResourcesPath);
        const parser = new GenericParser(getParserConfiguration(realInputPath));
        results = await parser.calculateMetrics();
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension as unsupported files", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "example.unknownExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension as unsupported files", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "ExampleWithoutExtension");
            expect(results.unsupportedFiles.includes(filePath)).toBe(true);
        });

        it("should calculate lines of code for files with unknown file extension", async () => {
            testFileMetric(
                unknownTestResourcesPath + "example.unknownExtension",
                FileMetric.linesOfCode,
                5,
            );
        });

        it("should calculate lines of code for files with no file extension", async () => {
            testFileMetric(
                unknownTestResourcesPath + "ExampleWithoutExtension",
                FileMetric.linesOfCode,
                6,
            );
        });

        it("should calculate lines of code for an empty, unsupported file", async () => {
            testFileMetric(unknownTestResourcesPath + "empty", FileMetric.linesOfCode, 1);
        });

        it("should still list files with known extension", async () => {
            const filePath = fs.realpathSync(unknownTestResourcesPath + "known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
