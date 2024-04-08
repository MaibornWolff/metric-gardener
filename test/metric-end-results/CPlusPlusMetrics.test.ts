import { beforeAll, describe, it } from "vitest";
import { expectFileMetric, mockConsole, parseAllFileMetrics } from "./TestHelper.js";
import { MetricName, FileMetricResults } from "../../src/parser/metrics/Metric.js";

describe("C++ metrics tests", () => {
    const cppTestResourcesPath = "./resources/c++/";

    let results: Map<string, FileMetricResults>;

    function testFileMetric(path: string, metric: MetricName, expected: number): void {
        expectFileMetric(results, cppTestResourcesPath + path, metric, expected);
    }

    beforeAll(async () => {
        mockConsole();
        results = await parseAllFileMetrics(cppTestResourcesPath);
    });

    describe("Parses C++ Complexity metric", () => {
        it("should count correctly for a more complex, non-empty source code file", () => {
            testFileMetric("cpp_example_code.cpp", "complexity", 11);
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric("weird_lines.cpp", "complexity", 10);
        });

        it("should count correctly for a header with templates", () => {
            testFileMetric("helpful_templates.h", "complexity", 9);
        });

        it("should count all kinds of branching statements correctly, including nested ones", () => {
            testFileMetric("branches.cpp", "complexity", 12);
        });

        it("should count for two switch case labels and a function, but not for the default label", () => {
            testFileMetric("switch_case.cpp", "complexity", 3);
        });

        it("should count catch-statements and no return statements", () => {
            testFileMetric("try_catch.cxx", "complexity", 8);
        });

        it("should count SEH except blocks", () => {
            testFileMetric("seh_except.cxx", "complexity", 2);
        });

        it("should not count class declarations", () => {
            testFileMetric("classes.hpp", "complexity", 0);
        });

        it("should count function declarations, including default and deleted functions", () => {
            testFileMetric("function_declarations.hpp", "complexity", 6);
        });

        it("should count function implementations", () => {
            testFileMetric("function_implementations.cpp", "complexity", 6);
        });

        it("should count only &&, ||, and and or logical operations, not xor or ^", () => {
            testFileMetric("logical_operation.cpp", "complexity", 11);
        });
    });

    describe("parses C++ classes metric", () => {
        it("Should count all kinds of class declarations", () => {
            testFileMetric("classes.hpp", "classes", 11);
        });

        it("should also count template class declarations", () => {
            testFileMetric("helpful_templates.h", "classes", 1);
        });

        it("should count classes correctly in a more typical header file", () => {
            testFileMetric("cpp_example_header.hpp", "classes", 2);
        });

        it("should also count for structs", () => {
            testFileMetric("structs.hpp", "classes", 6);
        });

        it("should also count class declarations in source code files", () => {
            testFileMetric("source_class.cxx", "classes", 1);
        });

        it("should count enums and unions as class", () => {
            testFileMetric("enums_and_unions.cpp", "classes", 20);
        });

        it("should not count typedefs without definition of a new class/struct/union", () => {
            testFileMetric("typedefs.h", "classes", 11);
        });
    });

    describe("parses C++ functions metric", () => {
        it("should count function implementations, including lambda functions", () => {
            testFileMetric("function_implementations.cpp", "functions", 6);
        });

        it("should count function declarations, including default and deleted functions", () => {
            testFileMetric("function_declarations.hpp", "functions", 6);
        });

        it("should count functions that are declared and implemented in a source file", () => {
            testFileMetric("source_class.cxx", "functions", 2);
        });

        it("should count template functions", () => {
            testFileMetric("helpful_templates.h", "functions", 5);
        });

        it("should count correctly in a more complex file, also counting for constructors and destructors", () => {
            testFileMetric("cpp_example_code.cpp", "functions", 10);
        });

        it("should count correctly in a more complex header file, also counting virtual and pure virtual (abstract) functions", () => {
            testFileMetric("cpp_example_header.hpp", "functions", 11);
        });
    });

    describe("parses C++ comment lines metric", () => {
        it("should count inline, doxygen and block comments correctly", () => {
            testFileMetric("comments.cc", "comment_lines", 14);
        });
    });

    describe("parses C++ lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty file", () => {
            testFileMetric("cpp_example_code.cpp", "lines_of_code", 71);
        });

        it("should count one line for an empty file", () => {
            testFileMetric("empty.cxx", "lines_of_code", 1);
        });
    });

    describe("parses C++ real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric("cpp_example_code.cpp", "real_lines_of_code", 48);
        });

        it("should count correctly for an empty file", () => {
            testFileMetric("empty.cxx", "real_lines_of_code", 0);
        });

        it("should count correctly for a header file", () => {
            testFileMetric("cpp_example_header.hpp", "real_lines_of_code", 32);
        });

        it("should count correctly if there are comments in the same line as actual code", () => {
            testFileMetric("same_line_comment.cpp", "real_lines_of_code", 4);
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric("weird_lines.cpp", "real_lines_of_code", 89);
        });
    });
});
