import { testFileMetrics } from "./TestHelper";

describe("Python metrics test", () => {
    const pythonTestResourcesPath = "./resources/python/";

    describe("parses Python McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetrics(pythonTestResourcesPath + "if.py", "mcc", 4);
        });
    });

    describe("parses Python comment lines metric", () => {
        it.skip("should count correctly, excluding inline and block comments", async () => {
            await testFileMetrics(pythonTestResourcesPath + "loops.py", "comment_lines", 5);
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", async () => {
            await testFileMetrics(pythonTestResourcesPath + "blocks.py", "real_lines_of_code", 9);
        });

        it("should count correctly for a non-empty file with nested loops and comments", async () => {
            await testFileMetrics(pythonTestResourcesPath + "loops.py", "real_lines_of_code", 4);
        });

        it.skip("should count correctly in the presence of block comments", async () => {
            await testFileMetrics(
                pythonTestResourcesPath + "block-comment.py",
                "real_lines_of_code",
                3
            );
        });
    });
});
