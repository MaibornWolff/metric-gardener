import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("TSX metrics tests.", () => {
    const tsxTestResourcesPath = "./resources/tsx/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, tsxTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(tsxTestResourcesPath);
    });

    describe("parses classes metric", () => {
        it("should count all classes, interfaces, enums and object types with a type name.", () => {
            testFileMetric("class-likes.tsx", FileMetric.classes, 8);
        });
        it("should count only the object literal type, not other type alias declarations.", () => {
            testFileMetric("type.tsx", FileMetric.classes, 1);
        });
        it("should count all abstract, normal and nested classes.", () => {
            testFileMetric("differentClasses.tsx", FileMetric.classes, 6);
        });
    });

    describe("parses functions metric", () => {
        it("should count all function declarations and lambda expressions.", () => {
            testFileMetric("functions.tsx", FileMetric.functions, 9);
        });
    });

    describe("parses complexity metric", () => {
        it("should count all if, if-else, for, while and do-while statements.", () => {
            testFileMetric("branches_loops.tsx", FileMetric.complexity, 11);
        });
        it("should count the ternary expression.", () => {
            testFileMetric("ternary.tsx", FileMetric.complexity, 2);
        });
        it("should count the catch statement, but not the function call catch().", () => {
            testFileMetric("catch.tsx", FileMetric.complexity, 6);
        });
        it("should also count the arrow function in the react element.", () => {
            testFileMetric("arrowFunctionReact.tsx", FileMetric.complexity, 2);
        });
        it("should also count the ternary statement in react element.", () => {
            testFileMetric("ternaryReact.tsx", FileMetric.complexity, 2);
        });
    });

    describe("parses comment lines metric", () => {
        it("should count all multiline, one-line and inline comments.", () => {
            testFileMetric("comments.tsx", FileMetric.commentLines, 11);
        });
        it("should count no comment lines when the file is empty.", () => {
            testFileMetric("empty.tsx", FileMetric.commentLines, 0);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count comments and empty lines.", () => {
            testFileMetric("comments.tsx", FileMetric.realLinesOfCode, 16);
        });
        it("should count no real lines of code when the file is empty.", () => {
            testFileMetric("empty.tsx", FileMetric.realLinesOfCode, 0);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count all lines in file.", () => {
            testFileMetric("comments.tsx", FileMetric.linesOfCode, 26);
        });
        it("should count 1 line of code when the file is empty.", () => {
            testFileMetric("empty.tsx", FileMetric.linesOfCode, 1);
        });
    });
});
