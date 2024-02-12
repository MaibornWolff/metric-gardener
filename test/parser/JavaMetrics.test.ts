import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";
const javaTestResourcesPath = "./resources/java/";

describe("Java metrics tests.", () => {
    describe("parses classes metric", () => {
        it("should count classes with different access-modifier correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.classes + "/Classes.java",
                FileMetric.classes,
                2
            );
        });

        it("should count the interface, class, abstract class and enum correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.classes + "/Classlike.java",
                FileMetric.classes,
                4
            );
        });

        it("should count nested classes correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.classes + "/NestedClasses.java",
                FileMetric.classes,
                4
            );
        });

        it("should not count the fields or methods of a class correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath +
                    "/" +
                    FileMetric.classes +
                    "/ClassWithFieldsAndMethods.java",
                FileMetric.classes,
                2
            );
        });

        it("should count zero for an empty java file", async () => {
            await testFileMetric(javaTestResourcesPath + "Empty.java", FileMetric.classes, 0);
        });

        it("should count zero for a file that contains only comments", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.classes + "/Comment.java",
                FileMetric.classes,
                0
            );
        });

        it("should count all record declarations as classes", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.classes + "/Person.java",
                FileMetric.classes,
                3
            );
        });
    });

    describe("parses lines of code metric", () => {
        it("should count lines of code for a non-empty file correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.linesOfCode + "/ClassForLOC.java",
                FileMetric.linesOfCode,
                24
            );
        });

        it("should count lines of code for an empty file correctly", async () => {
            await testFileMetric(javaTestResourcesPath + "Empty.java", FileMetric.linesOfCode, 1);
        });

        it("should count lines of code correctly for a non-empty file that starts and ends with a line break", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.linesOfCode + "/Linebreak.java",
                FileMetric.linesOfCode,
                7
            );
        });

        it("should count lines of code for multiline strings, function calls, etc. correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.linesOfCode + "/MultilineLineOfCode.java",
                FileMetric.linesOfCode,
                30
            );
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count for comments", async () => {
            await testFileMetric(
                javaTestResourcesPath +
                    "/" +
                    FileMetric.realLinesOfCode +
                    "/RealLineOfCodeAndComments.java",
                FileMetric.realLinesOfCode,
                23
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.realLinesOfCode + "/InlineComment.java",
                FileMetric.realLinesOfCode,
                4
            );
        });

        it("should count correctly if there is multi-line code", async () => {
            await testFileMetric(
                javaTestResourcesPath +
                    "/" +
                    FileMetric.realLinesOfCode +
                    "/MultilineRealLineOfCode.java",
                FileMetric.realLinesOfCode,
                57
            );
        });

        it("should count the code lines in the initialization block", async () => {
            await testFileMetric(
                javaTestResourcesPath +
                    "/" +
                    FileMetric.realLinesOfCode +
                    "/InitializationBlock.java",
                FileMetric.realLinesOfCode,
                10
            );
        });

        it("should count zero real lines of code for an empty file", async () => {
            await testFileMetric(
                javaTestResourcesPath + "Empty.java",
                FileMetric.realLinesOfCode,
                0
            );
        });
    });

    describe("parses functions metric", () => {
        it("should count static and non-static function declarations correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/StaticFuntions.java",
                FileMetric.functions,
                5
            );
        });

        it("should count function declaration with different access-modifiers correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/FunctionAccessModifier.java",
                FileMetric.functions,
                4
            );
        });

        it("should count constructors as function declaration", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/Constructor.java",
                FileMetric.functions,
                11
            );
        });

        it("should count for function declarations in an interface", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/InterfaceFunction.java",
                FileMetric.functions,
                2
            );
        });

        it("should count function declarations in an abstract class", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/AbstractClassFunction.java",
                FileMetric.functions,
                2
            );
        });

        it("should count overloading functions correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/OverloadFuntion.java",
                FileMetric.functions,
                3
            );
        });

        it("should count all function declarations and lambda expression", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/LambdaExpression.java",
                FileMetric.functions,
                6
            );
        });

        it("should count all record-constructors", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.functions + "/RecordMethods.java",
                FileMetric.functions,
                3
            );
        });
    });

    describe("parses Complexity metric", () => {
        it("should count one method declaration and its contained if-statements and logical operations correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/IfStatements.java",
                FileMetric.complexity,
                8
            );
        });

        it("should count one method declaration, the number of for- and while-statements and the containing logical operators correctly", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/WhileAndForLoop.java",
                FileMetric.complexity,
                11
            );
        });

        it("should count one method declaration, all logical operators and all case- and default-labels", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/SwitchStatement.java",
                FileMetric.complexity,
                9
            );
        });

        it("should count all method declarations, if-statements and catch blocks, but not throw and finally blocks.", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/TryCatchFinally.java",
                FileMetric.complexity,
                8
            );
        });

        it("should count all method declarations and ternary operations", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/TernaryOperation.java",
                FileMetric.complexity,
                2
            );
        });

        it("should count all method declarations (incl. lambda expressions) and for-loops, but not method references.", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/DifferentFunctions.java",
                FileMetric.complexity,
                5
            );
        });

        it("should count logical operators and function declarations.", async () => {
            await testFileMetric(
                javaTestResourcesPath + "/" + FileMetric.complexity + "/LogicalOperator.java",
                FileMetric.complexity,
                6
            );
        });
    });

    describe("parses comment-lines metric", () => {
        it("should count the lines that contain inline, multi-line and single-line comments.", async () => {
            await testFileMetric(
                javaTestResourcesPath +
                    "/" +
                    FileMetric.commentLines +
                    "/DifferentKindOfComments.java",
                FileMetric.commentLines,
                28
            );
        });
    });
});
