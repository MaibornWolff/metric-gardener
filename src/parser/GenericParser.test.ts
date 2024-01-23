import { GenericParser } from "./GenericParser";
import fs from "fs";
import { Configuration } from "./Configuration";
import { strcmp } from "./helper/Helper";
import { CouplingResult } from "./metrics/Metric";

describe("GenericParser", () => {
    const phpTestResourcesPath = "./resources/php/";
    const csharpTestResourcesPath = "./resources/c-sharp/";
    const tsTestResourcesPath = "./resources/typescript/";
    const goTestResourcesPath = "./resources/go/";
    const pythonTestResourcesPath = "./resources/python/";
    const unknownTestResourcesPath = "./resources/unknown/";

    /**
     * Gets a parser configuration for the test cases.
     * @param sourcesPath Path to the source files.
     * @param parseDependencies Whether to enable parsing dependencies.
     * @param formatFilePaths Whether to format the output file paths to be independent
     * of project location and platform.
     * When this is enabled, do not forget to also format the file path when accessing metric results from the output.
     * You should use {@link formatPrintPath} for this, e.g.:
     * <pre><code>
     * results.fileMetrics.get(formatPrintPath(inputPath, config))
     * </code></pre>
     */
    function getParserConfiguration(
        sourcesPath: string,
        parseDependencies = false,
        formatFilePaths = false
    ) {
        return new Configuration(
            sourcesPath,
            "invalid/output/path",
            parseDependencies,
            "",
            false,
            formatFilePaths, // For project location-independent testing
            formatFilePaths // For platform-independent testing
        );
    }

    /**
     * Sorts the contents of the specified {@link CouplingResult} in a deterministic way.
     * This is necessary as there can be deviations concerning the order
     * in which files are found on different platforms.
     * @param couplingResult The CouplingResult whose contents should be sorted.
     */
    function sortCouplingResults(couplingResult: CouplingResult) {
        // Sort the metrics in ascending order of the file paths
        couplingResult.metrics = new Map(
            [...couplingResult.metrics.entries()].sort((a, b) => strcmp(a[0], b[0]))
        );
        couplingResult.relationships.sort((a, b) => {
            // Unique ID for relationships adapted from metrics/coupling/Coupling.ts getRelationships(...)
            const uniqueIdA = a.toNamespace + a.fromNamespace;
            const uniqueIdB = b.toNamespace + b.fromNamespace;
            return strcmp(uniqueIdA, uniqueIdB);
        });
    }

    describe("parses PHP McCabeComplexity metric", () => {
        it("should count branching statements correctly", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "if-statements.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(8);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should not count multiple return statements within functions and methods like sonar", async () => {
            const inputPath = fs.realpathSync(
                phpTestResourcesPath + "multiple-return-statements.php"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "case-statements.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "throw-try-catch-finally.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "loops.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(7);
        });
    });

    describe("parses PHP lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "empty-last-line.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(66);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(65);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "empty.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "one-line.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "line-break.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses PHP real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                43
            );
        });

        it("should count correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "empty.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "same-line-comment.php");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                11
            );
        });
    });

    describe("parses PHP commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets and comment " +
                "lines inside block comment",
            async () => {
                const inputPath = fs.realpathSync(phpTestResourcesPath + "php-example-code.php");
                const parser = new GenericParser(getParserConfiguration(inputPath));
                const results = await parser.calculateMetrics();

                expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(
                    12
                );
            }
        );
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "if-statements.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(8);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(9);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            const inputPath = fs.realpathSync(
                tsTestResourcesPath + "multiple-return-statements.ts"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case but no default statements correctly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "case-statements.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "throw-try-catch-finally.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should count loops properly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "loops.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("classes")?.metricValue).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(9);
        });
    });

    describe("parses TypeScript commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "comments.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "same-line-comment.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(4);
        });
    });

    describe("parses TypeScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "ts-example-code.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(416);
        });
        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "non-empty-last-line.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(415);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "empty.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "one-line.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "line-break.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses TypeScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "real-lines-of-code.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                7
            );
        });

        it("should count correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "empty.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                0
            );
        });

        it("should count correctly for a file with a single comment", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "single-comment.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "same-line-comment.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "weird-lines.ts");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                32
            );
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(7);
        });

        it("should count functions and methods correctly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(2);
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            const inputPath = fs.realpathSync(
                goTestResourcesPath + "multiple-return-statements.go"
            );
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should not count any class declaration", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "classes.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count case statements correctly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "case-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "throw-try-catch-finally.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(0);
        });

        it("should count loops properly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "loops.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses GO functions metric", () => {
        it("should count functions and methods properly", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("functions")?.metricValue).toBe(2);
        });
    });

    describe("parses GO commentLines metric", () => {
        it(
            "should count number of comment lines correctly, including line with curly brackets, inline comments" +
                " and lines of the block comment",
            async () => {
                const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
                const parser = new GenericParser(getParserConfiguration(inputPath));
                const results = await parser.calculateMetrics();

                expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(
                    6
                );
            }
        );

        it("should count number of comment lines correctly, including multiple successive comments", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "go-example-code.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(9);
        });
    });

    describe("parses GO lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "empty-last-line.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(54);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "go-example-code.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(53);
        });

        it("should count number of lines correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "empty.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "one-line.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "line-break.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("lines_of_code")?.metricValue).toBe(2);
        });
    });

    describe("parses Go real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments,  inline comments and empty lines", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "go-example-code.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                32
            );
        });

        it("should count correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "empty.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                0
            );
        });

        it("should count correctly if there is a comment that includes code", async () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                19
            );
        });
    });

    describe("parses Python McCabeComplexity metric", () => {
        it("should count if statements correctly", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "if.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("mcc")?.metricValue).toBe(4);
        });
    });

    describe("parses Python comment lines metric", () => {
        it.skip("should count correctly, excluding inline and block comments", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "loops.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("comment_lines")?.metricValue).toBe(5);
        });
    });

    describe("parses Python real lines of code metric", () => {
        it("should count correctly for a non-empty file with pythons non-C-syntax code blocks", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "blocks.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                9
            );
        });

        it("should count correctly for an empty file", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "empty.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                0
            );
        });

        it("should count correctly for a non-empty file with nested loops and comments", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "loops.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                4
            );
        });

        it.skip("should count correctly in the presence of block comments", async () => {
            const inputPath = fs.realpathSync(pythonTestResourcesPath + "block-comment.py");
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            expect(results.fileMetrics.get(inputPath)?.get("real_lines_of_code")?.metricValue).toBe(
                3
            );
        });
    });

    describe("parsing PHP dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(inputPath, true, true));

            const results = await parser.calculateMetrics();
            const couplingResult = results.couplingMetrics;
            sortCouplingResults(couplingResult);

            expect(couplingResult).toMatchSnapshot();
        });
    });

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const inputPath = fs.realpathSync(csharpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(inputPath, true, true));

            const results = await parser.calculateMetrics();
            const couplingResult = results.couplingMetrics;
            sortCouplingResults(couplingResult);

            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });

    describe("Include files with unknown or no file extension", () => {
        it("should list files with unknown file extension", async () => {
            const inputPath = fs.realpathSync(unknownTestResourcesPath);
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            const filePath = fs.realpathSync(unknownTestResourcesPath + "example.unknownExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should list files with no file extension", async () => {
            const inputPath = fs.realpathSync(unknownTestResourcesPath);
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            const filePath = fs.realpathSync(unknownTestResourcesPath + "ExampleWithoutExtension");
            expect(results.unknownFiles.includes(filePath)).toBe(true);
        });

        it("should still list files with known extension", async () => {
            const inputPath = fs.realpathSync(unknownTestResourcesPath);
            const parser = new GenericParser(getParserConfiguration(inputPath));
            const results = await parser.calculateMetrics();

            const filePath = fs.realpathSync(unknownTestResourcesPath + "known.java");
            expect(results.fileMetrics.has(filePath)).toBe(true);
        });
    });
});
