import { getCouplingMetrics, testFileMetrics } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const couplingResult = await getCouplingMetrics(
                csharpTestResourcesPath + "coupling-examples/"
            );
            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });

    describe("parses C# complexity metric", () => {
        it("should count loops properly", async () => {
            await testFileMetrics(csharpTestResourcesPath + "loops.cs", FileMetric.complexity, 4);
        });

        it("should count if statements correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "if-statements.cs",
                FileMetric.complexity,
                11
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(csharpTestResourcesPath + "classes.cs", FileMetric.complexity, 1);
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "case-statements.cs",
                FileMetric.complexity,
                4
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "functions-and-methods.cs",
                FileMetric.complexity,
                8
            );
        });

        it("should not count multiple return statements within functions and methods correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "multiple-return-statements.cs",
                FileMetric.complexity,
                3
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "throw-try-catch-finally.cs",
                FileMetric.complexity,
                1
            );
        });
    });

    describe("parses C# classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetrics(csharpTestResourcesPath + "classes.cs", FileMetric.classes, 6);
        });
    });

    describe("parses C# functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "functions-and-methods.cs",
                FileMetric.functions,
                8
            );
        });
    });

    describe("parses C# commentLines metric", () => {
        it("should count properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "comments.cs",
                FileMetric.commentLines,
                14
            );
        });

        it("should count properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "same-line-comment.cs",
                FileMetric.commentLines,
                4
            );
        });
    });

    describe("parses C# lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "c-sharp-example-code.cs",
                FileMetric.linesOfCode,
                28
            );
        });

        it("should count number of lines correctly for a non-empty file with non-empty last line", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "non-empty-last-line.cs",
                FileMetric.linesOfCode,
                27
            );
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetrics(csharpTestResourcesPath + "empty.cs", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "one-line.cs",
                FileMetric.linesOfCode,
                1
            );
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "line-break.cs",
                FileMetric.linesOfCode,
                2
            );
        });
    });

    describe("parses C# real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "real-lines-of-code.cs",
                FileMetric.realLinesOfCode,
                8
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "empty.cs",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly for a file with a single comment", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "single-comment.cs",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "same-line-comment.cs",
                FileMetric.realLinesOfCode,
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "weird-lines.cs",
                FileMetric.realLinesOfCode,
                32
            );
        });
    });
});
