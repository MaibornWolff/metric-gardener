import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("Java metrics tests.", () => {
    const javaTestResourcesPath = "./resources/java/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, javaTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(javaTestResourcesPath);
    });

    describe("parses classes metric", () => {
        it("should count classes with different access-modifier correctly", () => {
            testFileMetric("classes/Classes.java", "classes", 2);
        });

        it("should count the interface, class, abstract class and enum correctly", () => {
            testFileMetric("classes/Classlike.java", "classes", 4);
        });

        it("should count nested classes correctly", () => {
            testFileMetric("classes/NestedClasses.java", "classes", 4);
        });

        it("should not count the fields or methods of a class", () => {
            testFileMetric("classes/ClassWithFieldsAndMethods.java", "classes", 2);
        });

        it("should count zero for an empty java file", () => {
            testFileMetric("Empty.java", "classes", 0);
        });

        it("should count zero for a file that contains only comments", () => {
            testFileMetric("classes/Comment.java", "classes", 0);
        });

        it("should count all record declarations as classes", () => {
            testFileMetric("classes/Person.java", "classes", 3);
        });

        it("should count all anonymous class declarations", () => {
            testFileMetric("classes/AnonymousClass.java", "classes", 2);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count lines of code for a non-empty file correctly", () => {
            testFileMetric("lines_of_code/ClassForLOC.java", "lines_of_code", 24);
        });

        it("should count lines of code for an empty file correctly", () => {
            testFileMetric("Empty.java", "lines_of_code", 1);
        });

        it("should count lines of code correctly for a non-empty file that starts and ends with a line break", () => {
            testFileMetric("lines_of_code/Linebreak.java", "lines_of_code", 7);
        });

        it("should count lines of code for multiline strings, function calls, etc. correctly", () => {
            testFileMetric("lines_of_code/MultilineLineOfCode.java", "lines_of_code", 30);
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count for comments", () => {
            testFileMetric(
                "real_lines_of_code/RealLineOfCodeAndComments.java",
                "real_lines_of_code",
                23,
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", () => {
            testFileMetric("real_lines_of_code/InlineComment.java", "real_lines_of_code", 4);
        });

        it("should count correctly if there is multi-line code", () => {
            testFileMetric(
                "real_lines_of_code/MultilineRealLineOfCode.java",
                "real_lines_of_code",
                57,
            );
        });

        it("should count the code lines in the initialization block", () => {
            testFileMetric("real_lines_of_code/InitializationBlock.java", "real_lines_of_code", 10);
        });

        it("should count zero real lines of code for an empty file", () => {
            testFileMetric("Empty.java", "real_lines_of_code", 0);
        });
    });

    describe("parses functions metric", () => {
        it("should count static and non-static function declarations correctly", () => {
            testFileMetric("functions/StaticFunctions.java", "functions", 5);
        });

        it("should count function declaration with different access-modifiers correctly", () => {
            testFileMetric("functions/FunctionAccessModifier.java", "functions", 4);
        });

        it("should count constructors as function declaration", () => {
            testFileMetric("functions/Constructor.java", "functions", 11);
        });

        it("should count for function declarations in an interface", () => {
            testFileMetric("functions/InterfaceFunction.java", "functions", 2);
        });

        it("should count function declarations in an abstract class", () => {
            testFileMetric("functions/AbstractClassFunction.java", "functions", 2);
        });

        it("should count overloading functions correctly", () => {
            testFileMetric("functions/OverloadFunction.java", "functions", 3);
        });

        it("should count all function declarations and lambda expression", () => {
            testFileMetric("functions/LambdaExpression.java", "functions", 6);
        });

        it("should count all record-constructors", () => {
            testFileMetric("functions/RecordMethods.java", "functions", 3);
        });
        it("should count all initialization blocks as function declarations", () => {
            testFileMetric("InitializationBlock.java", "functions", 2);
        });
    });

    describe("parses Complexity metric", () => {
        it("should count one method declaration and its contained if-statements and logical operations correctly", () => {
            testFileMetric("complexity/IfStatements.java", "complexity", 8);
        });

        it("should count one method declaration, the number of for- and while-statements and the containing logical operators correctly", () => {
            testFileMetric("complexity/WhileAndForLoop.java", "complexity", 11);
        });

        it("should count one method declaration and all case labels, but no default-labels", () => {
            testFileMetric("complexity/SwitchStatement.java", "complexity", 8);
        });

        it("should count all method declarations, if-statements and catch blocks, but not throw and finally blocks.", () => {
            testFileMetric("complexity/TryCatchFinally.java", "complexity", 8);
        });

        it("should count all method declarations and ternary operations", () => {
            testFileMetric("complexity/TernaryOperation.java", "complexity", 2);
        });

        it("should count all method declarations (incl. lambda expressions) and for-loops, but not method references.", () => {
            testFileMetric("complexity/DifferentFunctions.java", "complexity", 5);
        });

        it("should count logical operators and function declarations.", () => {
            testFileMetric("complexity/LogicalOperator.java", "complexity", 6);
        });
        it("should count all initialization blocks", () => {
            testFileMetric("InitializationBlock.java", "complexity", 2);
        });
    });

    describe("parses comment-lines metric", () => {
        it("should count the lines that contain inline, multi-line and single-line comments.", () => {
            testFileMetric("comment_lines/DifferentKindOfComments.java", "comment_lines", 28);
        });
    });

    describe("parses keywords in comments metric", () => {
        it("should count all predefined keywords in comments", () => {
            testFileMetric("keywords.java", "keywords_in_comments", 8);
        });
    });
});
