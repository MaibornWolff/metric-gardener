import { GenericParser } from "./GenericParser";
import fs from "fs";
import { Configuration } from "./Configuration";

describe("GenericParser", () => {
    const phpTestResourcesPath = "./resources/php/";
    const csharpTestResourcesPath = "./resources/c-sharp/";
    const tsTestResourcesPath = "./resources/typescript/";
    const goTestResourcesPath = "./resources/go/";
    const pythonTestRecourcesPath = "./resources/python/";

    function getParserConfiguration(sourcesPath: string, parseDependencies = false) {
        return new Configuration(sourcesPath, "invalid/output/path", parseDependencies, "", false);
    }

    describe("parses PHP McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "if-statements.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should not count multiple return statements within functions and methods like sonar", () => {
            const inputPath = fs.realpathSync(
                phpTestResourcesPath + "multiple-return-statements.php"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "case-statements.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "throw-try-catch-finally.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "loops.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(7);
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "empty-last-line.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(66);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(65);
        });

        it("should count number of lines correctly for an empty file", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "empty.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "one-line.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "line-break.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                43
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "same-line-comment.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                11
            );
        });
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "if-statements.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(9);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            const inputPath = fs.realpathSync(
                tsTestResourcesPath + "multiple-return-statements.ts"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case but no default statements correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "case-statements.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "throw-try-catch-finally.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "loops.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(9);
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly and ignore file header, class description and doc block comment lines", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "comments.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(5);
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "ts-example-code.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(416);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "non-empty-last-line.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(415);
        });

        it("should count number of lines correctly for an empty file", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "empty.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "one-line.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "line-break.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                43
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "same-line-comment.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                2
            );
        });

        it("should count weirdly formatted lines of code correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "weird-lines.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                32
            );
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            const inputPath = fs.realpathSync(
                goTestResourcesPath + "multiple-return-statements.go"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "classes.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "case-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "throw-try-catch-finally.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "loops.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses GO functions metric", () => {
        it("should count functions and methods properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(2);
        });
    });

    describe("parses GO lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "empty-last-line.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(54);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "go-example-code.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(53);
        });

        it("should count number of lines correctly for an empty file", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "empty.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "one-line.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "line-break.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "go-example-code.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                32
            );
        });

        it("should count correctly if there is a comment that includes code", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                19
            );
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", () => {
            const inputPath = fs.realpathSync(pythonTestRecourcesPath + "blocks.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                9
            );
        });

        it("should count correctly for a non-empty file with nested loops and comments", () => {
            const inputPath = fs.realpathSync(pythonTestRecourcesPath + "loops.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                4
            );
        });

        it("should count correctly in the presence of block comments", () => {
            const inputPath = fs.realpathSync(pythonTestRecourcesPath + "block-comment.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                3
            );
        });
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(inputPath, true));
            const results = parser.calculateMetrics();

            expect(results.couplingMetrics).toMatchSnapshot();
        });
    });

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", () => {
            const inputPath = fs.realpathSync(csharpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(inputPath, true));
            const results = parser.calculateMetrics();

            expect(results.couplingMetrics).toMatchSnapshot();
        });
    });
});
