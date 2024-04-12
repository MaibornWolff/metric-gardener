import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getTestConfiguration,
    mockPosixPath,
    mockWin32Path,
} from "../../../test/metric-end-results/TestHelper.js";
import {
    findFilesAsync,
    createRegexFor,
    formatPrintPath,
    getNodeTypeNamesByCategories,
    getNodeTypesByCategories,
    getQueryStatementsByCategories,
    lookupLowerCase,
} from "./Helper.js";
import { NodeTypeCategory, NodeTypeConfig } from "./Model.js";
import { NodeTypeQueryStatement } from "../queries/QueryStatements.js";
import fs from "fs/promises";
import { ConfigurationParams } from "../Configuration.js";
import { Dir, Dirent, Stats } from "fs";

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

    describe("formatPrintPath(...)", () => {
        it("should change nothing when the config does not say otherwise", () => {
            mockPosixPath();
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path");

            expect(formatPrintPath(filePath, config)).toEqual(filePath);
        });

        it("should create UNIX-style relative paths when relativePaths is set", () => {
            mockPosixPath();
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path", { relativePaths: true });

            expect(formatPrintPath(filePath, config)).toEqual("for/the/test.extension");
        });

        it("should create DOS-style relative paths when relativePaths is set", () => {
            mockWin32Path();
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration("C:\\Users\\user\\documents\\code", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config)).toEqual("more-code\\file.extension");
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (UNIX-style)", () => {
            mockPosixPath();
            const filePath = "/some/path/for/the/test.extension";
            const config = getTestConfiguration("/some/path/for/the/test.extension", {
                relativePaths: true,
            });

            expect(formatPrintPath(filePath, config)).toEqual("test.extension");
        });

        it("should return the file name if the file path equals the sources path when relativePaths is set (DOS-style)", () => {
            mockWin32Path();
            const filePath = "C:\\Users\\user\\documents\\code\\more-code\\file.extension";
            const config = getTestConfiguration(
                "C:\\Users\\user\\documents\\code\\more-code\\file.extension",
                { relativePaths: true },
            );

            expect(formatPrintPath(filePath, config)).toEqual("file.extension");
        });
    });

    describe("findFilesAsync(...)", () => {
        beforeEach(() => {
            mockPosixPath();
        });

        it("should find one file, if the sourcePath is a single file", async () => {
            mockFs();
            await expectFiles("/some/path");
        });

        it("should find all files in a directory", async () => {
            mockFs(["file1", "file2"]);
            await expectFiles("/some/path/file1", "/some/path/file2");
        });

        it("should find all files in a directory and its subdirectories", async () => {
            mockFs(["file1", { subdir: ["file2", "file3"] }]);
            await expectFiles(
                "/some/path/file1",
                "/some/path/subdir/file2",
                "/some/path/subdir/file3",
            );
        });

        it("should not include excluded files", async () => {
            mockFs([
                "file1",
                { subdir: ["file2", { excluded: ["so", "many", "sad", "files", "here"] }] },
                { subdir2: ["where-am-i", { "404": ["not found"] }] },
            ]);
            await expectFilesWithConfig(
                { exclusions: "excluded, subdir2" },
                "/some/path/file1",
                "/some/path/subdir/file2",
            );
        });

        it("should throw an error, if the sourcePath is not a file or directory", () => {
            const error = new Error("ENOENT: no such file or directory, lstat '/invalid/path'");
            vi.spyOn(fs, "lstat").mockRejectedValue(error);

            const config = getTestConfiguration("/invalid/path");

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            expect(findFilesAsync(config).next()).rejects.toThrowError(error);
        });

        type Entry = string | { [key: string]: Entry[] };

        function mockFs(entries?: Entry[]): void {
            if (!entries) {
                vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => true } as Stats);
            } else {
                vi.spyOn(fs, "lstat").mockResolvedValue({ isFile: () => false } as Stats);
                mockOpenDir(entries);
            }
        }

        function mockOpenDir(entries: Entry[]): void {
            vi.spyOn(fs, "opendir").mockResolvedValueOnce(
                // eslint-disable-next-line @typescript-eslint/require-await
                (async function* (): AsyncGenerator<Dirent> {
                    for (const entry of entries) {
                        if (typeof entry === "string") {
                            yield { name: entry, isDirectory: () => false } as Dirent;
                        } else {
                            for (const [name, children] of Object.entries(entry)) {
                                mockOpenDir(children);
                                yield { name, isDirectory: () => true } as Dirent;
                            }
                        }
                    }
                })() as unknown as Dir,
            );
        }

        async function expectFiles(...files: string[]): Promise<void> {
            await expectFilesWithConfig(undefined, ...files);
        }

        async function expectFilesWithConfig(
            configOverrides?: Partial<ConfigurationParams>,
            ...files: string[]
        ): Promise<void> {
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

        describe("createRegexFor", () => {
            it("should match if the text contains one given keyword", () => {
                const keywords = ["bug"];
                const input = "this is a bug";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(1);
            });

            it("should not match if the input does not contain the keyword", () => {
                const keywords = ["bug"];
                const input = "this is a game";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(0);
            });

            it("should match if the the keyword string contains space", () => {
                const keywords = ["not good"];
                const input = "I am not good at programming :(";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(1);
            });

            it("should match case-insensitively", () => {
                const keywords = ["ToDo"];
                const input = "we have many TODO";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(1);
            });

            it("should match multiple time", () => {
                const keywords = ["ToDo"];
                const input = "we have many TODO today todo";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(2);
            });

            it("should match multiple keywords ", () => {
                const keywords = ["ToDo", "bug", "hello"];
                const input = "hello, we have many TODO today todo";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(3);
            });

            it("should NOT match if the keywords are contained in other words", () => {
                const keywords = ["todo, bug", "a"];
                const input = "we have many TODOs today, the music group ABBA should not be buggy";

                expect(Array.from(input.matchAll(createRegexFor(keywords))).length).toBe(0);
            });
        });
    });
});
