import { GenericParser } from "./GenericParser";
import fs from "fs";
import { Configuration } from "./Configuration";

describe("GenericParser", () => {
    const phpTestResourcesPath = "./resources/php/";
    const csharpTestResourcesPath = "./resources/c-sharp/";
    const tsTestResourcesPath = "./resources/typescript/";
    const goTestResourcesPath = "./resources/go/";

    function getParserConfiguration(sourcesPath: string, parseDependencies = false) {
        return new Configuration(sourcesPath, "invalid/output/path", parseDependencies, "", false, true);
    }

    describe("parses PHP McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = phpTestResourcesPath + "if-statements.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = phpTestResourcesPath + "functions-and-methods.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should not count multiple return statements within functions and methods like sonar", async () => {
            const inputPath = phpTestResourcesPath + "multiple-return-statements.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = phpTestResourcesPath + "classes.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", async () => {
            const inputPath = phpTestResourcesPath + "case-statements.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = phpTestResourcesPath + "throw-try-catch-finally.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", async () => {
            const inputPath = phpTestResourcesPath + "loops.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", async () => {
            const inputPath = phpTestResourcesPath + "classes.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", async () => {
            const inputPath = phpTestResourcesPath + "functions-and-methods.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(7);
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = phpTestResourcesPath + "empty-last-line.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(66);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = phpTestResourcesPath + "php-example-code.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(65);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = phpTestResourcesPath + "empty.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = phpTestResourcesPath + "one-line.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = phpTestResourcesPath + "line-break.php";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = tsTestResourcesPath + "if-statements.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(8);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = tsTestResourcesPath + "functions-and-methods.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(9);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            const inputPath = tsTestResourcesPath + "multiple-return-statements.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = tsTestResourcesPath + "classes.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case but no default statements correctly", async () => {
            const inputPath = tsTestResourcesPath + "case-statements.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = tsTestResourcesPath + "throw-try-catch-finally.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", async () => {
            const inputPath = tsTestResourcesPath + "loops.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", async () => {
            const inputPath = tsTestResourcesPath + "classes.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            const inputPath = tsTestResourcesPath + "functions-and-methods.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(9);
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly and ignore file header, class description and doc block comment lines", async () => {
            const inputPath = tsTestResourcesPath + "comments.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(5);
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = tsTestResourcesPath + "ts-example-code.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(416);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = tsTestResourcesPath + "non-empty-last-line.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(415);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = tsTestResourcesPath + "empty.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = tsTestResourcesPath + "one-line.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = tsTestResourcesPath + "line-break.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            const inputPath = tsTestResourcesPath + "real-lines-of-code.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                7
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            const inputPath = tsTestResourcesPath + "same-line-comment.ts";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                2
            );
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = goTestResourcesPath + "if-statements.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = goTestResourcesPath + "functions-and-methods.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            const inputPath = goTestResourcesPath + "multiple-return-statements.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = goTestResourcesPath + "classes.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", async () => {
            const inputPath = goTestResourcesPath + "case-statements.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = goTestResourcesPath + "throw-try-catch-finally.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count loops properly", async () => {
            const inputPath = goTestResourcesPath + "loops.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses GO functions metric", () => {
        it("should count functions and methods properly", async () => {
            const inputPath = goTestResourcesPath + "functions-and-methods.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(2);
        });
    });

    describe("parses GO lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = goTestResourcesPath + "empty-last-line.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(54);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = goTestResourcesPath + "go-example-code.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(53);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = goTestResourcesPath + "empty.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = goTestResourcesPath + "one-line.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = goTestResourcesPath + "line-break.go";
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const inputPath = phpTestResourcesPath + "coupling-examples/";
            const parser = new GenericParser(getParserConfiguration(inputPath, true));
            const results = await parser.calculateMetrics();

            expect(results.couplingMetrics).toMatchSnapshot();
        });
    });

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const inputPath = csharpTestResourcesPath + "coupling-examples/";
            const parser = new GenericParser(getParserConfiguration(inputPath, true));
            const results = await parser.calculateMetrics();

            expect(results.couplingMetrics).toMatchSnapshot();
        }, 10000);
    });
});
