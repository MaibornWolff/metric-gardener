import { beforeAll, describe, expect, it } from "vitest";
import {
    expectFileMetric,
    getCouplingMetrics,
    mockConsole,
    mockWin32Path,
    parseAllFileMetrics,
} from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, csharpTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(csharpTestResourcesPath);
    });

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            mockConsole();
            mockWin32Path({ skip: ["join", "resolve", "normalize"] });
            const couplingResult = await getCouplingMetrics(
                csharpTestResourcesPath + "coupling-examples/",
            );
            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });

    describe("parses C# complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric("loops.cs", FileMetric.complexity, 4);
        });

        it("should count if statements correctly", () => {
            testFileMetric("if-statements.cs", FileMetric.complexity, 11);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.cs", FileMetric.complexity, 1);
        });

        it("should count switch case labels, but no default labels", () => {
            testFileMetric("case-statements.cs", FileMetric.complexity, 4);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.cs", FileMetric.complexity, 8);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.cs", FileMetric.complexity, 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.cs", FileMetric.complexity, 1);
        });
    });

    describe("parses C# classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.cs", FileMetric.classes, 6);
        });
        it("should count record declarations", () => {
            testFileMetric("records.cs", FileMetric.classes, 5);
        });
    });

    describe("parses C# functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.cs", FileMetric.functions, 8);
        });
    });

    describe("parses C# commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.cs", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.cs", FileMetric.commentLines, 4);
        });
    });

    describe("parses C# lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("c-sharp-example-code.cs", FileMetric.linesOfCode, 28);
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric("non-empty-last-line.cs", FileMetric.linesOfCode, 27);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.cs", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.cs", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.cs", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses C# real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("real-lines-of-code.cs", FileMetric.realLinesOfCode, 8);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.cs", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric("single-comment.cs", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.cs", FileMetric.realLinesOfCode, 3);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.cs", FileMetric.realLinesOfCode, 32);
        });
    });
});
