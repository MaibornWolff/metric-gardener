import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Java metrics tests.", () => {
    const javaTestResourcesPath = "./resources/java/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, javaTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(javaTestResourcesPath);
    });

    describe("parses classes metric", () => {
        it("should count classes with different access-modifier correctly", () => {
            testFileMetric("classes/Classes.java", FileMetric.classes, 2);
        });

        it("should count the interface, class, abstract class and enum correctly", () => {
            testFileMetric("classes/Classlike.java", FileMetric.classes, 4);
        });

        it("should count nested classes correctly", () => {
            testFileMetric("classes/NestedClasses.java", FileMetric.classes, 4);
        });

        it("should not count the fields or methods of a class", () => {
            testFileMetric("classes/ClassWithFieldsAndMethods.java", FileMetric.classes, 2);
        });

        it("should count zero for an empty java file", () => {
            testFileMetric("Empty.java", FileMetric.classes, 0);
        });

        it("should count zero for a file that contains only comments", () => {
            testFileMetric("classes/Comment.java", FileMetric.classes, 0);
        });

        it("should count all record declarations as classes", () => {
            testFileMetric("classes/Person.java", FileMetric.classes, 3);
        });

        it("should count all anonymous class declarations", () => {
            testFileMetric("classes/AnonymousClass.java", FileMetric.classes, 2);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count lines of code for a non-empty file correctly", () => {
            testFileMetric("lines_of_code/ClassForLOC.java", FileMetric.linesOfCode, 24);
        });

        it("should count lines of code for an empty file correctly", () => {
            testFileMetric("Empty.java", FileMetric.linesOfCode, 1);
        });

        it("should count lines of code correctly for a non-empty file that starts and ends with a line break", () => {
            testFileMetric("lines_of_code/Linebreak.java", FileMetric.linesOfCode, 7);
        });

        it("should count lines of code for multiline strings, function calls, etc. correctly", () => {
            testFileMetric("lines_of_code/MultilineLineOfCode.java", FileMetric.linesOfCode, 30);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count for comments", () => {
            testFileMetric(
                "real_lines_of_code/RealLineOfCodeAndComments.java",
                FileMetric.realLinesOfCode,
                23,
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("real_lines_of_code/InlineComment.java", FileMetric.realLinesOfCode, 4);
        });

        it("should count correctly if there is multi-line code", () => {
            testFileMetric(
                "real_lines_of_code/MultilineRealLineOfCode.java",
                FileMetric.realLinesOfCode,
                57,
            );
        });

        it("should count the code lines in the initialization block", () => {
            testFileMetric(
                "real_lines_of_code/InitializationBlock.java",
                FileMetric.realLinesOfCode,
                10,
            );
        });

        it("should count zero real lines of code for an empty file", () => {
            testFileMetric("Empty.java", FileMetric.realLinesOfCode, 0);
        });
    });

    describe("parses functions metric", () => {
        it("should count static and non-static function declarations correctly", () => {
            testFileMetric("functions/StaticFunctions.java", FileMetric.functions, 5);
        });

        it("should count function declaration with different access-modifiers correctly", () => {
            testFileMetric("functions/FunctionAccessModifier.java", FileMetric.functions, 4);
        });

        it("should count constructors as function declaration", () => {
            testFileMetric("functions/Constructor.java", FileMetric.functions, 11);
        });

        it("should count for function declarations in an interface", () => {
            testFileMetric("functions/InterfaceFunction.java", FileMetric.functions, 2);
        });

        it("should count function declarations in an abstract class", () => {
            testFileMetric("functions/AbstractClassFunction.java", FileMetric.functions, 2);
        });

        it("should count overloading functions correctly", () => {
            testFileMetric("functions/OverloadFunction.java", FileMetric.functions, 3);
        });

        it("should count all function declarations and lambda expression", () => {
            testFileMetric("functions/LambdaExpression.java", FileMetric.functions, 6);
        });

        it("should count all record-constructors", () => {
            testFileMetric("functions/RecordMethods.java", FileMetric.functions, 3);
        });
        it("should count all initialization blocks as function declarations", () => {
            testFileMetric("InitializationBlock.java", FileMetric.functions, 2);
        });
    });

    describe("parses Complexity metric", () => {
        it("should count one method declaration and its contained if-statements and logical operations correctly", () => {
            testFileMetric("complexity/IfStatements.java", FileMetric.complexity, 8);
        });

        it("should count one method declaration, the number of for- and while-statements and the containing logical operators correctly", () => {
            testFileMetric("complexity/WhileAndForLoop.java", FileMetric.complexity, 11);
        });

        it("should count one method declaration and all case labels, but no default-labels", () => {
            testFileMetric("complexity/SwitchStatement.java", FileMetric.complexity, 8);
        });

        it("should count all method declarations, if-statements and catch blocks, but not throw and finally blocks.", () => {
            testFileMetric("complexity/TryCatchFinally.java", FileMetric.complexity, 8);
        });

        it("should count all method declarations and ternary operations", () => {
            testFileMetric("complexity/TernaryOperation.java", FileMetric.complexity, 2);
        });

        it("should count all method declarations (incl. lambda expressions) and for-loops, but not method references.", () => {
            testFileMetric("complexity/DifferentFunctions.java", FileMetric.complexity, 5);
        });

        it("should count logical operators and function declarations.", () => {
            testFileMetric("complexity/LogicalOperator.java", FileMetric.complexity, 6);
        });
        it("should count all initialization blocks", () => {
            testFileMetric("InitializationBlock.java", FileMetric.complexity, 2);
        });
    });

    describe("parses comment-lines metric", () => {
        it("should count the lines that contain inline, multi-line and single-line comments.", () => {
            testFileMetric(
                "comment_lines/DifferentKindOfComments.java",
                FileMetric.commentLines,
                28,
            );
        });
    });
});
