import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";

describe("TSX metrics tests.", () => {
    const tsxTestResourcesPath = "./resources/tsx/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(tsxTestResourcesPath);
    });

    describe("parses classes metric", () => {
        it("should count all classes, interfaces, enums and object types with a type name.", () => {
            testFileMetric(tsxTestResourcesPath + "/class-likes.tsx", FileMetric.classes, 8);
        });
        it("should count only the object literal type, not other type alias declarations.", () => {
            testFileMetric(tsxTestResourcesPath + "/type.tsx", FileMetric.classes, 1);
        });
        it("should count all abstract, normal and nested classes.", () => {
            testFileMetric(tsxTestResourcesPath + "/differentClasses.tsx", FileMetric.classes, 6);
        });
    });

    describe("parses functions metric", () => {
        it("should count all function declarations and lambda expressions.", () => {
            testFileMetric(tsxTestResourcesPath + "/functions.tsx", FileMetric.functions, 9);
        });
    });

    describe("parses complexity metric", () => {
        it("should count all if, if-else, for, while and do-while statements.", () => {
            testFileMetric(tsxTestResourcesPath + "/branches_loops.tsx", FileMetric.complexity, 11);
        });
        it("should count the ternary expression.", () => {
            testFileMetric(tsxTestResourcesPath + "/ternary.tsx", FileMetric.complexity, 2);
        });
        it("should count the catch statement, but not the function call catch().", () => {
            testFileMetric(tsxTestResourcesPath + "/catch.tsx", FileMetric.complexity, 6);
        });
        it("should also count the arrow function in the react element.", () => {
            testFileMetric(
                tsxTestResourcesPath + "/arrowFunctionReact.tsx",
                FileMetric.complexity,
                2,
            );
        });
        it("should also count the ternary statement in react element.", () => {
            testFileMetric(tsxTestResourcesPath + "/ternaryReact.tsx", FileMetric.complexity, 2);
        });
    });

    describe("parses comment lines metric", () => {
        it("should count all multiline, one-line and inline comments.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.commentLines, 11);
        });
        it("should count no comment lines when the file is empty.", () => {
            testFileMetric(tsxTestResourcesPath + "/empty.tsx", FileMetric.commentLines, 0);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count comments and empty lines.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.realLinesOfCode, 16);
        });
        it("should count no real lines of code when the file is empty.", () => {
            testFileMetric(tsxTestResourcesPath + "/empty.tsx", FileMetric.realLinesOfCode, 0);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count all lines in file.", () => {
            testFileMetric(tsxTestResourcesPath + "/comments.tsx", FileMetric.linesOfCode, 25);
        });
        it("should count 1 line of code when the file is empty.", () => {
            testFileMetric(tsxTestResourcesPath + "/empty.tsx", FileMetric.linesOfCode, 1);
        });
    });
});
