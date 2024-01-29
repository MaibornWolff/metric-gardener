import { testFileMetrics } from "./TestHelper";
const javaTestResourcesPath = "./resources/java/";

describe("Java metrics tests.", () => {
    describe("parses classes metric", () => {
        it("should count classes with different access-modifier correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "Classes.java", "classes", 2);
        });

        it("should count the interface, class, abstract class and enum correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "Classlike.java", "classes", 4);
        });

        it("should count nested classes correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "NestedClasses.java", "classes", 4);
        });

        it("should not count the fields or methods of a class correctly", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "ClassWithFieldsAndMethods.java",
                "classes",
                2
            );
        });

        it("should count zero for an empty java file", async () => {
            await testFileMetrics(javaTestResourcesPath + "Empty.java", "classes", 0);
        });

        it("should count zero for a file that contains only comments", async () => {
            await testFileMetrics(javaTestResourcesPath + "Comment.java", "classes", 0);
        });
    });

    describe("parses lines of code metric", () => {
        it("should count lines of code for a non-empty file correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "ClassForLOC.java", "lines_of_code", 24);
        });

        it("should count lines of code for an empty file correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "Empty.java", "lines_of_code", 1);
        });

        it("should count lines of code correctly for a non-empty file that starts and ends with a line break", async () => {
            await testFileMetrics(javaTestResourcesPath + "Linebreak.java", "lines_of_code", 7);
        });

        it("should count lines of code for multiline strings, function calls, etc. correctly", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "MultilineLineOfCode.java",
                "lines_of_code",
                30
            );
        });
    });

    describe("parses real lines of code metric", () => {
        it("should not count for comments", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "RealLineOfCodeAndComments.java",
                "real_lines_of_code",
                23
            );
        });

        it("should count correctly if there is a comment in the same line as actual code", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "InlineComment.java",
                "real_lines_of_code",
                4
            );
        });

        it("should count correctly if there is multi-line code", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "MultilineRealLineOfCode.java",
                "real_lines_of_code",
                57
            );
        });

        it("should count the code lines in the initialization block", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "InitializationBlock.java",
                "real_lines_of_code",
                10
            );
        });
    });

    describe("parses functions metric", () => {
        it("should count static and non-static function declarations correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "StaticFuntions.java", "functions", 5);
        });

        it("should count function declaration with different access-modifiers correctly", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "FunctionAccessModifier.java",
                "functions",
                4
            );
        });

        it("should count constructors as function declaration", async () => {
            await testFileMetrics(javaTestResourcesPath + "Constructor.java", "functions", 11);
        });

        it("should count for function declarations in an interface", async () => {
            await testFileMetrics(javaTestResourcesPath + "InterfaceFunction.java", "functions", 2);
        });

        it("should count function declarations in an abstract class", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "AbstractClassFunction.java",
                "functions",
                2
            );
        });

        it("should count overloading functions correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "OverloadFuntion.java", "functions", 3);
        });
    });

    describe("parses McCabeComplexity metric", () => {
        it("should count one method declaration and its contained if-statements and logical operations correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "IfStatements.java", "mcc", 8);
        });

        it("should count one method declaration and its for and while-statements correctly", async () => {
            await testFileMetrics(javaTestResourcesPath + "WhileAndForLoop.java", "mcc", 3);
        });
    });
});
