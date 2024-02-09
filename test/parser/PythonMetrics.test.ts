import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    describe("parses Python Complexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetric(pythonTestResourcesPath + "if.py", FileMetric.complexity, 4);
        });
    });

    describe("parses Python comment lines metric", () => {
        it("should count correctly, excluding inline and block comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.commentLines,
                7
            );
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "blocks.py",
                FileMetric.realLinesOfCode,
                9
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "empty.py",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly for a non-empty file with nested loops and comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "loops.py",
                FileMetric.realLinesOfCode,
                4
            );
        });

        it("should count correctly in the presence of block comments", async () => {
            await testFileMetric(
                pythonTestResourcesPath + "block-comment.py",
                FileMetric.realLinesOfCode,
                3
            );
        });
    });
});
