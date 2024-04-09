import { beforeAll, describe, expect, it } from "vitest";
import {
    expectFileMetric,
    getCouplingMetrics,
    mockConsole,
    mockWin32Path,
    parseAllFileMetrics,
} from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
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
            testFileMetric("loops.cs", "complexity", 4);
        });

        it("should count if statements correctly", () => {
            testFileMetric("if-statements.cs", "complexity", 12);
        });

        it("should count all switch statement arms", () => {
            testFileMetric("switch-expression.cs", "complexity", 8);
        });

        it("should count all pattern combinators and and or", () => {
            testFileMetric("pattern-combinators.cs", "complexity", 11);
        });

        it("should not count any class declaration", () => {
            testFileMetric("classes.cs", "complexity", 5);
        });

        it("should count switch case labels, but no default labels", () => {
            testFileMetric("case-statements.cs", "complexity", 5);
        });

        it("should count functions and methods correctly", () => {
            testFileMetric("functions-and-methods.cs", "complexity", 8);
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric("multiple-return-statements.cs", "complexity", 3);
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric("throw-try-catch-finally.cs", "complexity", 1);
        });
    });

    describe("parses C# classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric("classes.cs", "classes", 9);
        });

        it("should count record declarations", () => {
            testFileMetric("records.cs", "classes", 5);
        });
    });

    describe("parses C# functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric("functions-and-methods.cs", "functions", 8);
        });

        it("should count all methods in classes, abstract classes and interfaces", () => {
            testFileMetric("classes.cs", "functions", 5);
        });

        it("should count all methods in records", () => {
            testFileMetric("records.cs", "functions", 8);
        });
    });

    describe("parses C# commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric("comments.cs", "comment_lines", 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric("same-line-comment.cs", "comment_lines", 4);
        });
    });

    describe("parses C# lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric("c-sharp-example-code.cs", "lines_of_code", 28);
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric("empty.cs", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric("one-line.cs", "lines_of_code", 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric("line-break.cs", "lines_of_code", 2);
        });
    });

    describe("parses C# real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("real-lines-of-code.cs", "real_lines_of_code", 8);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.cs", "real_lines_of_code", 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric("single-comment.cs", "real_lines_of_code", 0);
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("same-line-comment.cs", "real_lines_of_code", 3);
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric("weird-lines.cs", "real_lines_of_code", 32);
        });
    });
});
