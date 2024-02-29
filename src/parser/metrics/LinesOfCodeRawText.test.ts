import fs from "fs";
import { LinesOfCodeRawText } from "./LinesOfCodeRawText";
import { FileMetric } from "./Metric";

describe("LinesOfCodeRawText.calculate(...)", () => {
    const unsupportedTestResourcesPath = "./resources/unsupported/";

    it("should calculate lines of code correctly for a file with multiple lines", async () => {
        const sourceCode: string = await fs.promises.readFile(
            unsupportedTestResourcesPath + "ExampleWithoutExtension",
            { encoding: "utf8" },
        );
        expect(await LinesOfCodeRawText.calculate(sourceCode)).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 6,
        });
    });

    it("should calculate lines of code correctly for an empty file", async () => {
        expect(await LinesOfCodeRawText.calculate("")).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 1,
        });
    });

    it("should calculate lines of code correctly for an one-line file", async () => {
        expect(await LinesOfCodeRawText.calculate("")).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 1,
        });
    });
});
