import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTestConfiguration } from "../../../test/metric-end-results/TestHelper.js";
import {
    findFilesAsync,
    formatPrintPath,
    getFileExtension,
    getNodeTypeNamesByCategories,
    getNodeTypesByCategories,
    getQueryStatementsByCategories,
    lookupLowerCase,
    replaceForwardWithBackwardSlashes,
} from "./Helper.js";
import path from "path";
import { NodeTypeCategory, NodeTypeConfig } from "./Model.js";
import { NodeTypeQueryStatement } from "../queries/QueryStatements.js";
import fs from "fs/promises";
import { ConfigurationParams } from "../Configuration.js";
import { Dir, Stats } from "fs";

describe("Helper.ts", () => {
    describe("lookupLowerCase<V>(...)", () => {
        const numbers = new Map<string, number>([
            ["key", 1],
            ["KEY", 2],
            ["kEy", 3],
        ]);
        const strings = new Map<string, string>([
            ["key", "value"],
            ["KEY", "VALUE"],
            ["kEy", "VaLuE"],
        ]);
        const noLowerCaseKey = new Map<string, object>([["KEY", { key: "value" }]]);

        it("should return the value for a key that is in the map", () => {
            expect(lookupLowerCase(numbers, "key")).toBe(1);
            expect(lookupLowerCase(strings, "key")).toBe("value");
        });

        it("should return the value for a key that is in the map, regardless of the case", () => {
            expect(lookupLowerCase(numbers, "KEY")).toBe(1);
            expect(lookupLowerCase(strings, "KEY")).toBe("value");
            expect(lookupLowerCase(numbers, "kEy")).toBe(1);
            expect(lookupLowerCase(strings, "kEy")).toBe("value");
        });

        it("should return undefined for a key that is not in the map", () => {
            expect(lookupLowerCase(numbers, "not in map")).toBeUndefined();
            expect(lookupLowerCase(strings, "not in map")).toBeUndefined();
        });

        it("should return undefined for a key that is not in the map in lower case", () => {
            expect(lookupLowerCase(noLowerCaseKey, "KEY")).toBeUndefined();
        });
    });

    describe("replaceForwardWithBackwardSlashes(...)", () => {
        it("should replace all forward slashes with backward slashes", () => {
            const forwardSlashPath = "/some/path/for/the/test.extension";
            expect(replaceForwardWithBackwardSlashes(forwardSlashPath)).toEqual(
                "\\some\\path\\for\\the\\test.extension",
            );
        });

        it("should not replace backward slashes", () => {
            const backwardSlashPath = "C:\\Users\\user\\documents\\code\\file.extension";
            expect(replaceForwardWithBackwardSlashes(backwardSlashPath)).toEqual(
                "C:\\Users\\user\\documents\\code\\file.extension",
            );
        });

        it("should replace all forward slashes with backward slashes in a mixed path", () => {
            const mixedSlashPath = "/some/path\\for\\the/test.extension";
            expect(replaceForwardWithBackwardSlashes(mixedSlashPath)).toEqual(
                "\\some\\path\\for\\the\\test.extension",
            );
        });
    });

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

    describe("getFileExtension(...)", () => {
        it("should return the file extension of a file path", () => {
            const filePath1 = "/some/path/for/the/test.extension";
            const filePath2 = "/some/path/for/the/test.EXTENSION";
            const filePath3 = "/some/path/for/the/test.7z";
            expect(getFileExtension(filePath1)).toEqual("extension");
            expect(getFileExtension(filePath2)).toEqual("EXTENSION");
            expect(getFileExtension(filePath3)).toEqual("7z");
        });

        it("should return the file extension of a file path with multiple dots", () => {
            const filePath = "/some/path/for/the/test.with.multiple.dots.extension";
            expect(getFileExtension(filePath)).toEqual("extension");
        });

        it("should return the file extension of a file path with a dot at the beginning", () => {
            const filePath = "/some/path/for/the/.dotfile";
            expect(getFileExtension(filePath)).toEqual("dotfile");
        });

        it("should return an empty string if there is no file extension", () => {
            const filePath = "/some/path/for/the/test";
            expect(getFileExtension(filePath)).toEqual("");
        });

        it("should return an empty string for relative paths with no file extension", () => {
            const filePath1 = "./some/relative/path";
            const filePath2 = "../../some/relative/path";
            const filePath3 = ".\\some\\relative\\path";
            const filePath4 = "..\\..\\some\\relative\\path";
            expect(getFileExtension(filePath1)).toEqual("");
            expect(getFileExtension(filePath2)).toEqual("");
            expect(getFileExtension(filePath3)).toEqual("");
            expect(getFileExtension(filePath4)).toEqual("");
        });
    });

    describe("findFilesAsync(...)", () => {
        beforeEach(() => {
            vi.spyOn(path, "join").mockImplementation((...paths: string[]) => paths.join("/"));
        });

        it("should find one file, if the sourcePath is a single file", async () => {
            vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => true } as Stats);
            await expectFiles("/some/path");
        });

        it("should find all files in a directory", async () => {
            vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => false } as Stats);
            vi.spyOn(fs, "opendir").mockResolvedValue(
                (async function* () {
                    yield { name: "file1", isDirectory: () => false };
                    yield { name: "file2", isDirectory: () => false };
                })() as unknown as Dir,
            );

            await expectFiles("/some/path/file1", "/some/path/file2");
        });

        it("should find all files in a directory and its subdirectories", async () => {
            vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => false } as Stats);
            vi.spyOn(fs, "opendir")
                .mockResolvedValueOnce(
                    (async function* () {
                        yield { name: "file1", isDirectory: () => false };
                        yield { name: "subdir", isDirectory: () => true };
                    })() as unknown as Dir,
                )
                .mockResolvedValueOnce(
                    (async function* () {
                        yield { name: "file2", isDirectory: () => false };
                        yield { name: "file3", isDirectory: () => false };
                    })() as unknown as Dir,
                );

            await expectFiles(
                "/some/path/file1",
                "/some/path/subdir/file2",
                "/some/path/subdir/file3",
            );
        });

        it("should not include excluded files", async () => {
            vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => false } as Stats);
            vi.spyOn(fs, "opendir")
                .mockResolvedValueOnce(
                    (async function* () {
                        yield { name: "file1", isDirectory: () => false };
                        yield { name: "subdir", isDirectory: () => true };
                        yield { name: "subdir2", isDirectory: () => true };
                    })() as unknown as Dir,
                )
                .mockResolvedValueOnce(
                    (async function* () {
                        yield { name: "file2", isDirectory: () => false };
                        yield { name: "excluded", isDirectory: () => true };
                    })() as unknown as Dir,
                )
                .mockResolvedValueOnce(
                    (async function* () {
                        yield { name: "file3", isDirectory: () => false };
                    })() as unknown as Dir,
                );

            await expectFilesWithConfig(
                { exclusions: "subdir, excluded" },
                "/some/path/file1",
                "/some/path/subdir2/file2",
            );
        });

        it("should throw an error, if the sourcePath is not a file or directory", () => {
            const error = new Error("ENOENT: no such file or directory, lstat '/invalid/path'");
            vi.spyOn(fs, "lstat").mockRejectedValue(error);

            const config = getTestConfiguration("/invalid/path");

            expect(findFilesAsync(config).next()).rejects.toThrowError(error);
        });

        async function expectFiles(...files: string[]) {
            await expectFilesWithConfig(undefined, ...files);
        }
        async function expectFilesWithConfig(
            configOverrides?: Partial<ConfigurationParams>,
            ...files: string[]
        ) {
            const config = getTestConfiguration("/some/path", configOverrides);

            const result: string[] = [];
            for await (const file of findFilesAsync(config)) {
                result.push(file);
            }

            expect(result).toEqual(files);
        }
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
