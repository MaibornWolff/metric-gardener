import { testCalculateMetrics } from "./TestHelper";
const javaTestResourcesPath = "./resources/java/";
describe("test metrics calculation for Java language.", () => {
    describe("parses classes metric", () => {
        it("count classes with different access-modifier", () => {
            testCalculateMetrics(javaTestResourcesPath + "Classes.java", "classes", 2);
        });
        it("count interface, abstract class, enum", () => {
            testCalculateMetrics(javaTestResourcesPath + "Classlike.java", "classes", 4);
        });
        it("count nested classes", () => {
            testCalculateMetrics(javaTestResourcesPath + "NestedClasses.java", "classes", 4);
        });
        it("count classes with one character as class name", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "SingleCharacterClassName.java",
                "classes",
                2
            );
        });
        it("dont count the fields or methods of class", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "ClassWithFieldsAndMethods.java",
                "classes",
                2
            );
        });
        it("count 0 for empty java file", () => {
            testCalculateMetrics(javaTestResourcesPath + "Empty.java", "classes", 0);
        });
        it("count 0 for file with only comments", () => {
            testCalculateMetrics(javaTestResourcesPath + "Comment.java", "classes", 0);
        });
    });

    describe("parses lines of code metric", () => {
        it("count lines of codes for non-empty file", () => {
            testCalculateMetrics(javaTestResourcesPath + "ClassForLOC.java", "lines_of_code", 24);
        });
        it("count lines of codes for empty file ", () => {
            testCalculateMetrics(javaTestResourcesPath + "Empty.java", "lines_of_code", 1);
        });
        it("count lines of codes for non-empty file starts and ends with line break ", () => {
            testCalculateMetrics(javaTestResourcesPath + "Linebreak.java", "lines_of_code", 7);
        });
        it("count lines of codes for multiline code ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "MultilineLineOfCode.java",
                "lines_of_code",
                30
            );
        });
    });

    describe("parses real lines of code metric", () => {
        it("dont count comments", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "RealLineOfCodeAndComments.java",
                "real_lines_of_code",
                23
            );
        });
        it("should count correctly if there is a comment in the same line as actual code ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "InlineComment.java",
                "real_lines_of_code",
                3
            );
        });
        it("should count correctly if there is multi-line code ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "MultilineRealLineOfCode.java",
                "real_lines_of_code",
                57
            );
        });
        it("should count the code lines in the initialization block ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "InitializationBlock.java",
                "real_lines_of_code",
                10
            );
        });
    });
    describe("parses functions metric", () => {
        it("count static and non-static function declaration", () => {
            testCalculateMetrics(javaTestResourcesPath + "StaticFuntions.java", "functions", 5);
        });
        it("should count function declaration with different access-modifier ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "FunctionAccessModifier.java",
                "functions",
                4
            );
        });
        it("should count constructor as function declaration", () => {
            testCalculateMetrics(javaTestResourcesPath + "Constructor.java", "functions", 11);
        });
        it("should count function declaration in interface  ", () => {
            testCalculateMetrics(javaTestResourcesPath + "InterfaceFunction.java", "functions", 2);
        });
        it("should count function declaration in abstract class  ", () => {
            testCalculateMetrics(
                javaTestResourcesPath + "AbstractClassFunction.java",
                "functions",
                2
            );
        });
        it("should count overloading functions  ", () => {
            testCalculateMetrics(javaTestResourcesPath + "OverloadFuntion.java", "functions", 3);
        });
    });
    describe("parses McCabeComplexity metric", () => {
        it("count 1 method declaration and its contained if statements ", () => {
            testCalculateMetrics(javaTestResourcesPath + "IfStatement.java", "mcc", 5);
        });
        it("count 1 method declaration and its for and while statements ", () => {
            testCalculateMetrics(javaTestResourcesPath + "WhileAndForLoop.java", "mcc", 3);
        });
    });
});
