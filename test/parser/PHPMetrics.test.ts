import { getParserConfiguration, sortCouplingResults, testFileMetrics } from "./TestHelper";
import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";

describe("PHP metrics tests", () => {
    const phpTestResourcesPath = "./resources/php/";

    describe("parses PHP McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            await testFileMetrics(phpTestResourcesPath + "if-statements.php", "mcc", 7);
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(phpTestResourcesPath + "functions-and-methods.php", "mcc", 7);
        });

        it("should not count multiple return statements within functions and methods like sonar", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "multiple-return-statements.php",
                "mcc",
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(phpTestResourcesPath + "classes.php", "mcc", 0);
        });

        it("should count case statements correctly", async () => {
            await testFileMetrics(phpTestResourcesPath + "case-statements.php", "mcc", 3);
        });

        it("should count try-catch-finally properly", async () => {
            await testFileMetrics(phpTestResourcesPath + "throw-try-catch-finally.php", "mcc", 2);
        });

        it("should count loops properly", async () => {
            await testFileMetrics(phpTestResourcesPath + "loops.php", "mcc", 4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetrics(phpTestResourcesPath + "classes.php", "classes", 3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "functions-and-methods.php",
                "functions",
                7
            );
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "empty-last-line.php",
                "lines_of_code",
                66
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "php-example-code.php",
                "lines_of_code",
                65
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(phpTestResourcesPath + "empty.php", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(phpTestResourcesPath + "one-line.php", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(phpTestResourcesPath + "line-break.php", "lines_of_code", 2);
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "php-example-code.php",
                "real_lines_of_code",
                43
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                phpTestResourcesPath + "same-line-comment.php",
                "real_lines_of_code",
                11
            );
        });
    });

    describe("parses PHP commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets and comment " +
                "lines inside block comment",
            async () => {
                await testFileMetrics(
                    phpTestResourcesPath + "php-example-code.php",
                    "comment_lines",
                    12
                );
            }
        );
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const realInputPath = fs.realpathSync(phpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(realInputPath, true, true));

            const results = await parser.calculateMetrics();
            const couplingResult = results.couplingMetrics;
            sortCouplingResults(couplingResult);

            expect(couplingResult).toMatchSnapshot();
        });
    });
});
