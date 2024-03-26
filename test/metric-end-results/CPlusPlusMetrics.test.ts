import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, parseAllFileMetrics } from "./TestHelper.js";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C++ metrics tests", () => {
    const cppTestResourcesPath = "./resources/c++/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: FileMetric, expected: number) {
        expectFileMetric(results, cppTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        results = await parseAllFileMetrics(cppTestResourcesPath);
    });

    describe("Parses C++ Complexity metric", () => {
        it("should count correctly for a more complex, non-empty source code file", () => {
            testFileMetric("cpp_example_code.cpp", FileMetric.complexity, 11);
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric("weird_lines.cpp", FileMetric.complexity, 10);
        });

        it("should count correctly for a header with templates", () => {
            testFileMetric("helpful_templates.h", FileMetric.complexity, 9);
        });

        it("should count all kinds of branching statements correctly, including nested ones", () => {
            testFileMetric("branches.cpp", FileMetric.complexity, 12);
        });

        it("should count for two switch case labels and a function, but not for the default label", () => {
            testFileMetric("switch_case.cpp", FileMetric.complexity, 3);
        });

        it("should count catch-statements and no return statements", () => {
            testFileMetric("try_catch.cxx", FileMetric.complexity, 8);
        });

        it("should count SEH except blocks", () => {
            testFileMetric("seh_except.cxx", FileMetric.complexity, 2);
        });

        it("should not count class declarations", () => {
            testFileMetric("classes.hpp", FileMetric.complexity, 0);
        });

        it("should count function declarations, including default and deleted functions", () => {
            testFileMetric("function_declarations.hpp", FileMetric.complexity, 6);
        });

        it("should count function implementations", () => {
            testFileMetric("function_implementations.cpp", FileMetric.complexity, 6);
        });

        it("should count only &&, ||, and and or logical operations, not xor or ^", () => {
            testFileMetric("logical_operation.cpp", FileMetric.complexity, 11);
        });
    });

    describe("parses C++ classes metric", () => {
        it("Should count all kinds of class declarations", () => {
            testFileMetric("classes.hpp", FileMetric.classes, 11);
        });

        it("should also count template class declarations", () => {
            testFileMetric("helpful_templates.h", FileMetric.classes, 1);
        });

        it("should count classes correctly in a more typical header file", () => {
            testFileMetric("cpp_example_header.hpp", FileMetric.classes, 2);
        });

        it("should also count for structs", () => {
            testFileMetric("structs.hpp", FileMetric.classes, 6);
        });

        it("should also count class declarations in source code files", () => {
            testFileMetric("source_class.cxx", FileMetric.classes, 1);
        });

        it("should count enums and unions as class", () => {
            testFileMetric("enums_and_unions.cpp", FileMetric.classes, 20);
        });

        it("should not count typedefs without definition of a new class/struct/union", () => {
            testFileMetric("typedefs.h", FileMetric.classes, 11);
        });
    });

    describe("parses C++ functions metric", () => {
        it("should count function implementations, including lambda functions", () => {
            testFileMetric("function_implementations.cpp", FileMetric.functions, 6);
        });

        it("should count function declarations, including default and deleted functions", () => {
            testFileMetric("function_declarations.hpp", FileMetric.functions, 6);
        });

        it("should count functions that are declared and implemented in a source file", () => {
            testFileMetric("source_class.cxx", FileMetric.functions, 2);
        });

        it("should count template functions", () => {
            testFileMetric("helpful_templates.h", FileMetric.functions, 5);
        });

        it("should count correctly in a more complex file, also counting for constructors and destructors", () => {
            testFileMetric("cpp_example_code.cpp", FileMetric.functions, 10);
        });

        it("should count correctly in a more complex header file, also counting virtual and pure virtual (abstract) functions", () => {
            testFileMetric("cpp_example_header.hpp", FileMetric.functions, 11);
        });
    });

    describe("parses C++ comment lines metric", () => {
        it("should count inline, doxygen and block comments correctly", () => {
            testFileMetric("comments.cc", FileMetric.commentLines, 14);
        });
    });

    describe("parses C++ lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty file", () => {
            testFileMetric("cpp_example_code.cpp", FileMetric.linesOfCode, 71);
        });

        it("should count one line for an empty file", () => {
            testFileMetric("empty.cxx", FileMetric.linesOfCode, 1);
        });
    });

    describe("parses C++ real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("cpp_example_code.cpp", FileMetric.realLinesOfCode, 48);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.cxx", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a header file", () => {
            testFileMetric("cpp_example_header.hpp", FileMetric.realLinesOfCode, 32);
        });

        it("should count correctly if there are comments in the same line as actual code", () => {
            testFileMetric("same_line_comment.cpp", FileMetric.realLinesOfCode, 4);
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric("weird_lines.cpp", FileMetric.realLinesOfCode, 89);
        });
    });
});
