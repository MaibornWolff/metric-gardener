import { getTestConfiguration } from "../../../test/metric-end-results/TestHelper";
import {
    formatPrintPath,
    getNodeTypeNamesByCategory,
    getNodeTypesByCategory,
    getQueryStatementsByCategories,
    getQueryStatementsByCategory,
} from "./Helper";
import path from "path";
import { NodeTypeCategory, NodeTypeConfig } from "./Model";
import { NodeTypeQueryStatement } from "../queries/QueryStatements";

describe("Helper.ts", () => {
    describe("formatPrintPath(...)", () => {
        it("should change nothing when the config does not say otherwise", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path");

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(filePath);
        });

        it("should replace forward slashes when enforceBackwardSlash is set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", { enforceBackwardSlash: true });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "\\some\\path\\for\\the\\test.extension",
            );
        });

        it("should not replace backward slashes when enforceBackwardSlash is set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(filePath);
        });

        it("should create UNIX-style relative paths when relativePaths is set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", { relativePaths: true });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("for/the/test.extension");
        });

        it("should create DOS-style relative paths when relativePaths is set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(
                "more-code\\file.extension",
            );
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (UNIX-style)", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path/for/the/test.extension", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual("test.extension");
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (DOS-style)", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration(
                "C:\\Users\\user\\documents\\code\\more-code\\file.extension",
                { relativePaths: true },
            );

            expect(formatPrintPath(filePath, config, path.win32)).toEqual("file.extension");
        });

        it("should both create relative paths and replace forward slashes in an UNIX-style path when both relativePaths and enforceBackwardSlash are set", () => {
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", {
                relativePaths: true,
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.posix)).toEqual(
                "for\\the\\test.extension",
            );
        });

        it("should only create relative paths for a DOS-style path when both relativePaths and enforceBackwardSlash are set", () => {
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                relativePaths: true,
                enforceBackwardSlash: true,
            });

            expect(formatPrintPath(filePath, config, path.win32)).toEqual(
                "more-code\\file.extension",
            );
        });
    });

    describe("Helper for node types", () => {
        const exampleNodeTypes: NodeTypeConfig[] = [
            {
                type_name: "node type 1",
                languages: ["cpp"],
                category: NodeTypeCategory.Other,
            },
            {
                type_name: "node type 2",
                languages: ["cpp", "js", "ts", "tsx"],
                activated_for_languages: ["cpp"],
                category: NodeTypeCategory.Comment,
            },
            {
                type_name: "node type 3",
                languages: ["cpp"],
                category: NodeTypeCategory.Other,
            },
            {
                type_name: "node type 4",
                languages: ["java"],
                category: NodeTypeCategory.Comment,
            },
            {
                type_name: "node type 5",
                languages: ["go"],
                category: NodeTypeCategory.Comment,
            },
            {
                type_name: "node type 6",
                languages: ["java"],
                category: NodeTypeCategory.ClassDefinition,
            },
        ];

        describe("getNodeTypesByCategory(...)", () => {
            it("should return all node types of a category", () => {
                const result = getNodeTypesByCategory(exampleNodeTypes, NodeTypeCategory.Comment);

                const expectedResult = [
                    {
                        type_name: "node type 2",
                        languages: ["cpp", "js", "ts", "tsx"],
                        activated_for_languages: ["cpp"],
                        category: NodeTypeCategory.Comment,
                    },
                    {
                        type_name: "node type 4",
                        languages: ["java"],
                        category: NodeTypeCategory.Comment,
                    },
                    {
                        type_name: "node type 5",
                        languages: ["go"],
                        category: NodeTypeCategory.Comment,
                    },
                ];

                expect(result).toEqual(expectedResult);
            });
        });

        describe("getNodeTypeNamesByCategory(...)", () => {
            it("should return the names of all node types of a category", () => {
                const result = getNodeTypeNamesByCategory(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                );

                const expectedResult = ["node type 2", "node type 4", "node type 5"];

                expect(result).toEqual(expectedResult);
            });
        });

        describe("getQueryStatementsByCategory(...)", () => {
            it("should return query statements fo all node types of a category", () => {
                const result = getQueryStatementsByCategory(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                );

                const expectedResult = [
                    new NodeTypeQueryStatement({
                        type_name: "node type 2",
                        languages: ["cpp", "js", "ts", "tsx"],
                        activated_for_languages: ["cpp"],
                        category: NodeTypeCategory.Comment,
                    }),
                    new NodeTypeQueryStatement({
                        type_name: "node type 4",
                        languages: ["java"],
                        category: NodeTypeCategory.Comment,
                    }),
                    new NodeTypeQueryStatement({
                        type_name: "node type 5",
                        languages: ["go"],
                        category: NodeTypeCategory.Comment,
                    }),
                ];

                expect(result).toEqual(expectedResult);
            });
        });

        describe("getQueryStatementsByCategories(...)", () => {
            it("should return query statements fo all node types that match one of the categories", () => {
                const result = getQueryStatementsByCategories(
                    exampleNodeTypes,
                    new Set([NodeTypeCategory.Comment, NodeTypeCategory.ClassDefinition]),
                );

                const expectedResult = [
                    new NodeTypeQueryStatement({
                        type_name: "node type 2",
                        languages: ["cpp", "js", "ts", "tsx"],
                        activated_for_languages: ["cpp"],
                        category: NodeTypeCategory.Comment,
                    }),
                    new NodeTypeQueryStatement({
                        type_name: "node type 4",
                        languages: ["java"],
                        category: NodeTypeCategory.Comment,
                    }),
                    new NodeTypeQueryStatement({
                        type_name: "node type 5",
                        languages: ["go"],
                        category: NodeTypeCategory.Comment,
                    }),
                    new NodeTypeQueryStatement({
                        type_name: "node type 6",
                        languages: ["java"],
                        category: NodeTypeCategory.ClassDefinition,
                    }),
                ];

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
