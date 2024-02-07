import { expectFileMetric, getParserConfiguration } from "./TestHelper";
import { FileMetric, MetricResult } from "../../src/parser/metrics/Metric";
import { GenericParser } from "../../src/parser/GenericParser";
import fs from "fs";

describe("C++ metrics tests", () => {
    const cppTestResourcesPath = "./resources/c++/";

    let results: Map<string, Map<string, MetricResult>>;

    const testFileMetric = (inputPath, metric, expected) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        const realInputPath = fs.realpathSync(cppTestResourcesPath);
        const parser = new GenericParser(getParserConfiguration(realInputPath));
        results = (await parser.calculateMetrics()).fileMetrics;
    });

    describe("Parses C++ Complexity metric", () => {
        it("should count correctly for a more complex, non-empty source code file", () => {
            testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.complexity,
                10
            );
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric(cppTestResourcesPath + "weird_lines.cpp", FileMetric.complexity, 10);
        });

        it("should count correctly for a header with templates", () => {
            testFileMetric(cppTestResourcesPath + "helpful_templates.h", FileMetric.complexity, 9);
        });

        it("should count all kinds of branching statements correctly, including nested ones", () => {
            testFileMetric(cppTestResourcesPath + "branches.cpp", FileMetric.complexity, 12);
        });

        it("should not count class declarations", () => {
            testFileMetric(cppTestResourcesPath + "classes.hpp", FileMetric.complexity, 0);
        });

        it("should not count function declarations", () => {
            testFileMetric(
                cppTestResourcesPath + "function_declarations.hpp",
                FileMetric.complexity,
                0
            );
        });

        it("should count function implementations", () => {
            testFileMetric(
                cppTestResourcesPath + "function_implementations.cpp",
                FileMetric.complexity,
                4
            );
        });
    });

    describe("parses C++ classes metric", () => {
        it("Should count all kinds of class declarations", () => {
            testFileMetric(cppTestResourcesPath + "classes.hpp", FileMetric.classes, 11);
        });

        it("should also count template class declarations", () => {
            testFileMetric(cppTestResourcesPath + "helpful_templates.h", FileMetric.classes, 1);
        });

        it("should count classes correctly in a more typical header file", () => {
            testFileMetric(cppTestResourcesPath + "cpp_example_header.hpp", FileMetric.classes, 2);
        });

        it("should also count for structs", () => {
            testFileMetric(cppTestResourcesPath + "structs.hpp", FileMetric.classes, 4);
        });

        it("should also count class declarations in source code files", () => {
            testFileMetric(cppTestResourcesPath + "source_class.cxx", FileMetric.classes, 1);
        });
    });

    describe("parses C++ functions metric", () => {
        it("should count function implementations", () => {
            testFileMetric(
                cppTestResourcesPath + "function_implementations.cpp",
                FileMetric.functions,
                4
            );
        });

        it("should not count function declarations", () => {
            testFileMetric(
                cppTestResourcesPath + "function_declarations.hpp",
                FileMetric.functions,
                0
            );
        });

        it("should count functions that are declared and implemented in a source file", () => {
            testFileMetric(cppTestResourcesPath + "source_class.cxx", FileMetric.functions, 2);
        });

        it("should count template functions", () => {
            testFileMetric(cppTestResourcesPath + "helpful_templates.h", FileMetric.functions, 5);
        });

        it("should count correctly in a more complex file, also counting for constructors", () => {
            testFileMetric(cppTestResourcesPath + "cpp_example_code.cpp", FileMetric.functions, 9);
        });
    });

    describe("parses C++ comment lines metric", () => {
        it("should count inline, doxygen and block comments correctly", () => {
            testFileMetric(cppTestResourcesPath + "comments.cc", FileMetric.commentLines, 14);
        });
    });

    describe("parses C++ lines of code metric", () => {
        it("should count the lines of code correctly for a non-empty file", () => {
            testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.linesOfCode,
                67
            );
        });

        it("should count one line for an empty file", () => {
            testFileMetric(cppTestResourcesPath + "empty.cxx", FileMetric.linesOfCode, 1);
        });
    });

    describe("parses C++ real lines of code metric", () => {
        it("should count correctly for a non-empty file, ignoring comments and empty lines", () => {
            testFileMetric(
                cppTestResourcesPath + "cpp_example_code.cpp",
                FileMetric.realLinesOfCode,
                45
            );
        });

        it("should count correctly for an empty file", () => {
            testFileMetric(cppTestResourcesPath + "empty.cxx", FileMetric.realLinesOfCode, 0);
        });

        it("should count correctly for a header file", () => {
            testFileMetric(
                cppTestResourcesPath + "cpp_example_header.hpp",
                FileMetric.realLinesOfCode,
                31
            );
        });

        it("should count correctly if there are comments in the same line as actual code", () => {
            testFileMetric(
                cppTestResourcesPath + "same_line_comment.cpp",
                FileMetric.realLinesOfCode,
                4
            );
        });

        it("should count correctly if the code format is really weird", () => {
            testFileMetric(
                cppTestResourcesPath + "weird_lines.cpp",
                FileMetric.realLinesOfCode,
                89
            );
        });
    });
});
