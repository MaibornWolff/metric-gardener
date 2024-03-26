import { describe, expect, it } from "vitest";
import { getTestConfiguration } from "../../../test/metric-end-results/TestHelper";
import {
    formatPrintPath,
    getNodeTypeNamesByCategories,
    getNodeTypesByCategories,
    getQueryStatementsByCategories,
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
                type_name: "node type 0",
                languages: ["rs"],
                category: NodeTypeCategory.If,
            },
            {
                type_name: "node type 1",
                languages: ["cpp"],
                category: NodeTypeCategory.Other,
            },
            {
                type_name: "node type 2",
                languages: ["cpp", "js", "ts", "tsx"],
                deactivated_for_languages: ["cpp"],
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
                const result = getNodeTypesByCategories(exampleNodeTypes, NodeTypeCategory.Comment);

                const expectedResult = [
                    exampleNodeTypes[2],
                    exampleNodeTypes[4],
                    exampleNodeTypes[5],
                ];

                expect(result).toEqual(expectedResult);
            });

            it("should return all node types that match one of multiple categories", () => {
                const result = getNodeTypesByCategories(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                    NodeTypeCategory.ClassDefinition,
                );

                const expectedResult = [
                    exampleNodeTypes[2],
                    exampleNodeTypes[4],
                    exampleNodeTypes[5],
                    exampleNodeTypes[6],
                ];

                expect(result).toEqual(expectedResult);
            });

            it("should return an empty list when no category is passed", () => {
                const result = getNodeTypesByCategories(exampleNodeTypes);

                const expectedResult: string[] = [];

                expect(result).toEqual(expectedResult);
            });
        });

        describe("getNodeTypeNamesByCategory(...)", () => {
            it("should return the names of all node types of a category", () => {
                const result = getNodeTypeNamesByCategories(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                );

                const expectedResult = ["node type 2", "node type 4", "node type 5"];

                expect(result).toEqual(expectedResult);
            });

            it("should return the names of all node types that match one of multiple categories", () => {
                const result = getNodeTypeNamesByCategories(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                    NodeTypeCategory.ClassDefinition,
                    NodeTypeCategory.If,
                );

                const expectedResult = [
                    "node type 0",
                    "node type 2",
                    "node type 4",
                    "node type 5",
                    "node type 6",
                ];

                expect(result).toEqual(expectedResult);
            });

            it("should return an empty list when no category is passed", () => {
                const result = getNodeTypeNamesByCategories(exampleNodeTypes);

                const expectedResult: string[] = [];

                expect(result).toEqual(expectedResult);
            });
        });

        describe("getQueryStatementsByCategory(...)", () => {
            it("should return query statements for all node types of a single category", () => {
                const result = getQueryStatementsByCategories(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                );

                const expectedResult = [
                    new NodeTypeQueryStatement({
                        type_name: "node type 2",
                        languages: ["cpp", "js", "ts", "tsx"],
                        deactivated_for_languages: ["cpp"],
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

            it("should return query statements for all node types that match one of multiple categories", () => {
                const result = getQueryStatementsByCategories(
                    exampleNodeTypes,
                    NodeTypeCategory.Comment,
                    NodeTypeCategory.ClassDefinition,
                );

                const expectedResult = [
                    new NodeTypeQueryStatement({
                        type_name: "node type 2",
                        languages: ["cpp", "js", "ts", "tsx"],
                        deactivated_for_languages: ["cpp"],
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

            it("should return an empty list when no category is passed", () => {
                const result = getQueryStatementsByCategories(exampleNodeTypes);

                const expectedResult: NodeTypeQueryStatement[] = [];

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
