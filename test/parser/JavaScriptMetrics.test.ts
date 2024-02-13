import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("JavaScript metrics tests", () => {
    const jsTestResourcesPath = "./resources/javascript/";

    describe("parses JavaScript Complexity metric", () => {
        it("should count if statements and logical operations (&& and ||) correctly", async () => {
            await testFileMetric(
                jsTestResourcesPath + "if-statements.js",
                FileMetric.complexity,
                7
            );
        });

        it("should count functions and methods correctly", async () => {
            await testFileMetric(
                jsTestResourcesPath + "functions-and-methods.js",
                FileMetric.complexity,
                8
            );
        });

        it("should not count multiple return statements within functions and methods", async () => {
            await testFileMetric(
                jsTestResourcesPath + "multiple-return-statements.js",
                FileMetric.complexity,
                3
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetric(jsTestResourcesPath + "classes.js", FileMetric.complexity, 3);
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetric(
                jsTestResourcesPath + "case-statements.js",
                FileMetric.complexity,
                4
            );
        });

        it("should count try-catch-finally properly by only counting the catch-block", async () => {
            await testFileMetric(
                jsTestResourcesPath + "throw-try-catch-finally.js",
                FileMetric.complexity,
                1
            );
        });

        it("should count loops properly", async () => {
            await testFileMetric(jsTestResourcesPath + "loops.js", FileMetric.complexity, 3);
        });
    });

    describe("parses JavaScript classes metric", () => {
        it("should count class declarations", async () => {
            await testFileMetric(jsTestResourcesPath + "classes.js", FileMetric.classes, 3);
        });
    });

    describe("parses JavaScript functions metric", () => {
        it("should count functions and methods properly", async () => {
            await testFileMetric(
                jsTestResourcesPath + "functions-and-methods.js",
                FileMetric.functions,
                8
            );
        });
    });

    describe("parses JavaScript comment lines metric", () => {
        it("should count comments properly, also counting file header, class description and doc block tag comment lines", async () => {
            await testFileMetric(jsTestResourcesPath + "comments.js", FileMetric.commentLines, 17);
        });

        it("should count comments properly, also in the presence of multiple block comments in the same line", async () => {
            await testFileMetric(
                jsTestResourcesPath + "same-line-comment.js",
                FileMetric.commentLines,
                4
            );
        });

        it("should count comments properly, also counting multiline block comments starting in the same line as another comment", async () => {
            await testFileMetric(
                jsTestResourcesPath + "consecutive-comments.js",
                FileMetric.commentLines,
                6
            );
        });
    });

    describe("parses JavaScript lines of code metric", () => {
        it("should count number of lines correctly for a non-empty file with empty last line", async () => {
            await testFileMetric(jsTestResourcesPath + "classes.js", FileMetric.linesOfCode, 24);
        });

        it("should count number of lines correctly for an empty file", async () => {
            await testFileMetric(jsTestResourcesPath + "empty.js", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with one non-empty line", async () => {
            await testFileMetric(jsTestResourcesPath + "one-line.js", FileMetric.linesOfCode, 1);
        });

        it("should count number of lines correctly for an file with just a line break", async () => {
            await testFileMetric(jsTestResourcesPath + "line-break.js", FileMetric.linesOfCode, 2);
        });
    });

    describe("parses JavaScript real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetric(
                jsTestResourcesPath + "comments.js",
                FileMetric.realLinesOfCode,
                7
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(jsTestResourcesPath + "empty.js", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a file with a single comment", async () => {
            await testFileMetric(
                jsTestResourcesPath + "single-comment.js",
                FileMetric.realLinesOfCode,
                0
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetric(
                jsTestResourcesPath + "same-line-comment.js",
                FileMetric.realLinesOfCode,
                3
            );
        });

        it("should count weirdly formatted lines of code correctly", async () => {
            await testFileMetric(
                jsTestResourcesPath + "weird-lines.js",
                FileMetric.realLinesOfCode,
                32
            );
        });
    });
});
