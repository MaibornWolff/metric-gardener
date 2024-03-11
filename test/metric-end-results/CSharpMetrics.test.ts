import { expectFileMetric, getCouplingMetrics, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(csharpTestResourcesPath);
    });

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const couplingResult = await getCouplingMetrics(
                csharpTestResourcesPath + "coupling-examples/",
            );
            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });

    describe("parses C# complexity metric", () => {
        it("should count loops properly", () => {
            testFileMetric(csharpTestResourcesPath + "loops.cs", FileMetric.complexity, 4);
        });

        it("should count if statements correctly", () => {
            testFileMetric(csharpTestResourcesPath + "if-statements.cs", FileMetric.complexity, 11);
        });

        it("should not count any class declaration", () => {
            testFileMetric(csharpTestResourcesPath + "classes.cs", FileMetric.complexity, 1);
        });

        it("should count switch case labels, but no default labels", () => {
            testFileMetric(
                csharpTestResourcesPath + "case-statements.cs",
                FileMetric.complexity,
                4,
            );
        });

        it("should count functions and methods correctly", () => {
            testFileMetric(
                csharpTestResourcesPath + "functions-and-methods.cs",
                FileMetric.complexity,
                8,
            );
        });

        it("should not count multiple return statements within functions and methods correctly", () => {
            testFileMetric(
                csharpTestResourcesPath + "multiple-return-statements.cs",
                FileMetric.complexity,
                3,
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", () => {
            testFileMetric(
                csharpTestResourcesPath + "throw-try-catch-finally.cs",
                FileMetric.complexity,
                1,
            );
        });
    });

    describe("parses C# classes metric", () => {
        it("should count class declarations", () => {
            testFileMetric(csharpTestResourcesPath + "classes.cs", FileMetric.classes, 6);
        });
        it("should count record declarations", () => {
            testFileMetric(csharpTestResourcesPath + "records.cs", FileMetric.classes, 5);
        });
    });

    describe("parses C# functions metric", () => {
        it("should count functions and methods properly", () => {
            testFileMetric(
                csharpTestResourcesPath + "functions-and-methods.cs",
                FileMetric.functions,
                8,
            );
        });
    });

    describe("parses C# commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", () => {
            testFileMetric(csharpTestResourcesPath + "comments.cs", FileMetric.commentLines, 14);
        });

        it("should count properly, also in the presence of multiple block comments in the same line", () => {
            testFileMetric(
                csharpTestResourcesPath + "same-line-comment.cs",
                FileMetric.commentLines,
                4,
            );
        });
    });

    describe("parses C# lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", () => {
            testFileMetric(
                csharpTestResourcesPath + "c-sharp-example-code.cs",
                FileMetric.linesOfCode,
                28,
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", () => {
            testFileMetric(
                csharpTestResourcesPath + "non-empty-last-line.cs",
                FileMetric.linesOfCode,
                27,
            );
        });

        it("should count number of lines correctly for an empty file", () => {
            testFileMetric(csharpTestResourcesPath + "empty.cs", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", () => {
            testFileMetric(csharpTestResourcesPath + "one-line.cs", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", () => {
            testFileMetric(csharpTestResourcesPath + "line-break.cs", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses C# real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                csharpTestResourcesPath + "real-lines-of-code.cs",
                FileMetric.realLinesOfCode,
                8,
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(csharpTestResourcesPath + "empty.cs", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", () => {
            testFileMetric(
                csharpTestResourcesPath + "single-comment.cs",
                FileMetric.realLinesOfCode,
                0,
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric(
                csharpTestResourcesPath + "same-line-comment.cs",
                FileMetric.realLinesOfCode,
                3,
            );
        });

        it("should count weirdly formatted lines of code correctly", () => {
            testFileMetric(
                csharpTestResourcesPath + "weird-lines.cs",
                FileMetric.realLinesOfCode,
                32,
            );
        });
    });
});
