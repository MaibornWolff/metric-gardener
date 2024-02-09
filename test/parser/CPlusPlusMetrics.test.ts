import { testFileMetric } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

describe("C++ metrics tests", () => {
    const cppTestResourcesPath = "./resources/c++/";

    describe("Parses C++ Complexity metric", () => {
        it("should count correctly for a more complex, non-empty source code file", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.complexity,
                10
            );
        });

        it("should count correctly if the code format is really weird", async () => {
            await testFileMetric(
                cppTestResourcesPath + "weird_lines.cpp",
                FileMetric.complexity,
                10
            );
        });

        it("should count correctly for a header with templates", async () => {
            await testFileMetric(
                cppTestResourcesPath + "helpful_templates.h",
                FileMetric.complexity,
                9
            );
        });

        it("should count all kinds of branching statements correctly, including nested ones", async () => {
            await testFileMetric(cppTestResourcesPath + "branches.cpp", FileMetric.complexity, 12);
        });

        it("should count for two switch case labels and a function, for now also for the default label", async () => {
            await testFileMetric(
                cppTestResourcesPath + "switch_case.cpp",
                FileMetric.complexity,
                4
            );
        });

        it("should count catch-statements and no return statements", async () => {
            await testFileMetric(cppTestResourcesPath + "try_catch.cxx", FileMetric.complexity, 8);
        });

        it("should not count class declarations", async () => {
            await testFileMetric(cppTestResourcesPath + "classes.hpp", FileMetric.complexity, 0);
        });

        it("should not count function declarations", async () => {
            await testFileMetric(
                cppTestResourcesPath + "function_declarations.hpp",
                FileMetric.complexity,
                0
            );
        });

        it("should count function implementations", async () => {
            await testFileMetric(
                cppTestResourcesPath + "function_implementations.cpp",
                FileMetric.complexity,
                6
            );
        });
    });

    describe("parses C++ classes metric", () => {
        it("Should count all kinds of class declarations", async () => {
            await testFileMetric(cppTestResourcesPath + "classes.hpp", FileMetric.classes, 11);
        });

        it("should also count template class declarations", async () => {
            await testFileMetric(
                cppTestResourcesPath + "helpful_templates.h",
                FileMetric.classes,
                1
            );
        });

        it("should count classes correctly in a more typical header file", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_header.hpp",
                FileMetric.classes,
                2
            );
        });

        it("should also count for structs", async () => {
            await testFileMetric(cppTestResourcesPath + "structs.hpp", FileMetric.classes, 4);
        });

        it("should also count class declarations in source code files", async () => {
            await testFileMetric(cppTestResourcesPath + "source_class.cxx", FileMetric.classes, 1);
        });
    });

    describe("parses C++ functions metric", () => {
        it("should count function implementations, including lambda functions", async () => {
            await testFileMetric(
                cppTestResourcesPath + "function_implementations.cpp",
                FileMetric.functions,
                6
            );
        });

        it("should not count function declarations", async () => {
            await testFileMetric(
                cppTestResourcesPath + "function_declarations.hpp",
                FileMetric.functions,
                0
            );
        });

        it("should count functions that are declared and implemented in a source file", async () => {
            await testFileMetric(
                cppTestResourcesPath + "source_class.cxx",
                FileMetric.functions,
                2
            );
        });

        it("should count template functions", async () => {
            await testFileMetric(
                cppTestResourcesPath + "helpful_templates.h",
                FileMetric.functions,
                5
            );
        });

        it("should count correctly in a more complex file, also counting for constructors", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.functions,
                9
            );
        });
    });

    describe("parses C++ comment lines metric", () => {
        it("should count inline, doxygen and block comments correctly", async () => {
            await testFileMetric(cppTestResourcesPath + "comments.cc", FileMetric.commentLines, 14);
        });
    });

    describe("parses C++ lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty file", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.linesOfCode,
                67
            );
        });

        it("should count one line for an empty file", async () => {
            await testFileMetric(cppTestResourcesPath + "empty.cxx", FileMetric.linesOfCode, 1);
        });
    });

    describe("parses C++ real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.realLinesOfCode,
                45
            );
        });

        it("should count correctly for an empty file", async () => {
            await testFileMetric(cppTestResourcesPath + "empty.cxx", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a header file", async () => {
            await testFileMetric(
                cppTestResourcesPath + "cpp_example_header.hpp",
                FileMetric.realLinesOfCode,
                31
            );
        });

        it("should count correctly if there are comments in the same line as actual code", async () => {
            await testFileMetric(
                cppTestResourcesPath + "same_line_comment.cpp",
                FileMetric.realLinesOfCode,
                4
            );
        });

        it("should count correctly if the code format is really weird", async () => {
            await testFileMetric(
                cppTestResourcesPath + "weird_lines.cpp",
                FileMetric.realLinesOfCode,
                89
            );
        });
    });
});
