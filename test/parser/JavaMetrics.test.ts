import { testFileMetrics } from "./TestHelper";
const javaTestResourcesPath = "./resources/java/";

describe("test metrics calculation for Java language.", () => {
    describe("parses classes metric", () => {
        it("count classes with different access-modifier", async () => {
            await testFileMetrics(javaTestResourcesPath + "Classes.java", "classes", 2);
        });

        it("count interface, abstract class, enum", async () => {
            await testFileMetrics(javaTestResourcesPath + "Classlike.java", "classes", 4);
        });

        it("count nested classes", async () => {
            await testFileMetrics(javaTestResourcesPath + "NestedClasses.java", "classes", 4);
        });

        it("count classes with one character as class name", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "SingleCharacterClassName.java",
                "classes",
                2
            );
        });

        it("dont count the fields or methods of class", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "ClassWithFieldsAndMethods.java",
                "classes",
                2
            );
        });

        it("count 0 for empty java file", async () => {
            await testFileMetrics(javaTestResourcesPath + "Empty.java", "classes", 0);
        });

        it("count 0 for file with only comments", async () => {
            await testFileMetrics(javaTestResourcesPath + "Comment.java", "classes", 0);
        });
    });

    describe("parses lines of code metric", () => {
        it("count lines of codes for non-empty file", async () => {
            await testFileMetrics(javaTestResourcesPath + "ClassForLOC.java", "lines_of_code", 24);
        });

        it("count lines of codes for empty file ", async () => {
            await testFileMetrics(javaTestResourcesPath + "Empty.java", "lines_of_code", 1);
        });

        it("count lines of codes for non-empty file starts and ends with line break ", async () => {
            await testFileMetrics(javaTestResourcesPath + "Linebreak.java", "lines_of_code", 7);
        });

        it("count lines of codes for multiline code ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "MultilineLineOfCode.java",
                "lines_of_code",
                30
            );
        });
    });

    describe("parses real lines of code metric", () => {
        it("dont count comments", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "RealLineOfCodeAndComments.java",
                "real_lines_of_code",
                23
            );
        });

        it("should count correctly if there is a comment in the same line as actual code ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "InlineComment.java",
                "real_lines_of_code",
                3
            );
        });

        it("should count correctly if there is multi-line code ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "MultilineRealLineOfCode.java",
                "real_lines_of_code",
                57
            );
        });

        it("should count the code lines in the initialization block ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "InitializationBlock.java",
                "real_lines_of_code",
                10
            );
        });
    });

    describe("parses functions metric", () => {
        it("count static and non-static function declaration", async () => {
            await testFileMetrics(javaTestResourcesPath + "StaticFuntions.java", "functions", 5);
        });

        it("should count function declaration with different access-modifier ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "FunctionAccessModifier.java",
                "functions",
                4
            );
        });

        it("should count constructor as function declaration", async () => {
            await testFileMetrics(javaTestResourcesPath + "Constructor.java", "functions", 11);
        });

        it("should count function declaration in interface  ", async () => {
            await testFileMetrics(javaTestResourcesPath + "InterfaceFunction.java", "functions", 2);
        });

        it("should count function declaration in abstract class  ", async () => {
            await testFileMetrics(
                javaTestResourcesPath + "AbstractClassFunction.java",
                "functions",
                2
            );
        });

        it("should count overloading functions  ", async () => {
            await testFileMetrics(javaTestResourcesPath + "OverloadFuntion.java", "functions", 3);
        });
    });

    describe("parses McCabeComplexity metric", () => {
        it("count 1 method declaration and its contained if statements ", async () => {
            await testFileMetrics(javaTestResourcesPath + "IfStatement.java", "mcc", 5);
        });

        it("count 1 method declaration and its for and while statements ", async () => {
            await testFileMetrics(javaTestResourcesPath + "WhileAndForLoop.java", "mcc", 3);
        });
    });
});
