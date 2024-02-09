import { getFileMetrics } from "./TestHelper";
import fs from "fs";

describe("Test for handling files with unknown or no file extension", () => {
    const unknownTestResourcesPath = "./resources/unknown/";

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension", async () => {
            const results = await getFileMetrics(unknownTestResourcesPath);

            const filePath = fs.realpathSync(unknownTestResourcesPath + "example.unknownExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension", async () => {
            const results = await getFileMetrics(unknownTestResourcesPath);

            const filePath = fs.realpathSync(unknownTestResourcesPath + "ExampleWithoutExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should still list files with known extension", async () => {
            const results = await getFileMetrics(unknownTestResourcesPath);

            const filePath = fs.realpathSync(unknownTestResourcesPath + "known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
