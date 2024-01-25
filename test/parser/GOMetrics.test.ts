import { testFileMetrics } from "./TestHelper";

describe("GO metric tests", () => {
    const goTestResourcesPath = "./resources/go/";

    describe("parses GO McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetrics(goTestResourcesPath + "if-statements.go", "mcc", 7);
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(goTestResourcesPath + "functions-and-methods.go", "mcc", 2);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetrics(goTestResourcesPath + "multiple-return-statements.go", "mcc", 3);
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(goTestResourcesPath + "classes.go", "mcc", 0);
        });

        it("should count case statements correctly", async () => {
            await testFileMetrics(goTestResourcesPath + "case-statements.go", "mcc", 3);
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetrics(goTestResourcesPath + "throw-try-catch-finally.go", "mcc", 0);
        });

        it("should count loops properly", async () => {
            await testFileMetrics(goTestResourcesPath + "loops.go", "mcc", 4);
        });
    });

    describe("parses GO functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetrics(goTestResourcesPath + "functions-and-methods.go", "functions", 2);
        });
    });

    describe("parses GO commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            async () => {
                await testFileMetrics(goTestResourcesPath + "if-statements.go", "comment_lines", 6);
            }
        );

        it("should count number of comment lines correctly, including multiple successive comments", async () => {
            await testFileMetrics(goTestResourcesPath + "go-example-code.go", "comment_lines", 9);
        });
    });

    describe("parses GO lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(goTestResourcesPath + "empty-last-line.go", "lines_of_code", 54);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(goTestResourcesPath + "go-example-code.go", "lines_of_code", 53);
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(goTestResourcesPath + "empty.go", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(goTestResourcesPath + "one-line.go", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(goTestResourcesPath + "line-break.go", "lines_of_code", 2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", async () => {
            await testFileMetrics(
                goTestResourcesPath + "go-example-code.go",
                "real_lines_of_code",
                32
            );
        });

        it("should count correctly if there is a comment that includes code", async () => {
            await testFileMetrics(
                goTestResourcesPath + "if-statements.go",
                "real_lines_of_code",
                19
            );
        });
    });
});
