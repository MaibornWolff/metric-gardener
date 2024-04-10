import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import { mockConsole } from "../../../test/metric-end-results/TestHelper.js";
import { WriteStream } from "fs";
import { NodeTypes } from "./NodeTypes.js";

let changelog = "";
let failWriteStream = false;
vi.mock("fs", () => ({
    createWriteStream: (): Partial<WriteStream> => {
        changelog = "";
        // eslint-disable-next-line @typescript-eslint/ban-types
        const listeners: Record<string, Function> = {};
        return {
            on(event: string, listener): WriteStream {
                listeners[event] = listener;
                return this as WriteStream;
            },
            write(chunk: string): boolean {
                changelog += chunk;
                return true;
            },
            end(): WriteStream {
                if (failWriteStream) {
                    listeners["error"](new Error("write?? not here!!"));
                } else {
                    listeners["finish"]();
                }
                return this as WriteStream;
            },
        };
    },
}));

describe("ImportNodeTypes", () => {
    afterEach(() => void vi.resetModules());

    describe("updateNodeTypesMappingFile()", () => {
        it("should log success to the console", async () => {
            mockConsole();
            vi.spyOn(fs, "readFile").mockResolvedValue("[]");
            vi.spyOn(fs, "writeFile").mockResolvedValueOnce();

            vi.doMock("../../parser/config/nodeTypesConfig.json", () => ({ default: [] }));
            const { updateNodeTypesMappingFile } = await import("./ImportNodeTypes.js");
            await updateNodeTypesMappingFile();

            expect(vi.mocked(console.log).mock.calls).toMatchSnapshot();
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should log failure to the console", async () => {
            mockConsole();

            vi.doMock("../../parser/config/nodeTypesConfig.json", () => ({ default: [] }));
            const { updateNodeTypesMappingFile } = await import("./ImportNodeTypes.js");

            vi.spyOn(fs, "readFile").mockResolvedValue("");
            await updateNodeTypesMappingFile();
            expect(console.log).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith(
                "Error while updating the node mappings. Cancel update...",
            );
            expect(console.error).toHaveBeenCalledWith(
                new Error("No node-types.json found for language cs"),
            );

            vi.clearAllMocks();

            vi.spyOn(fs, "readFile").mockRejectedValueOnce(new Error("File not found"));
            await updateNodeTypesMappingFile();
            expect(console.log).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith(
                "Error while updating the node mappings. Cancel update...",
            );
            expect(console.error).toHaveBeenCalledWith(
                new Error(
                    "Error while reading a node-types.json file from " +
                        "./node_modules/tree-sitter-c-sharp/src/node-types.json:\n" +
                        "Error: File not found",
                ),
            );

            vi.clearAllMocks();

            vi.spyOn(fs, "readFile").mockResolvedValue("[]");
            failWriteStream = true;
            await updateNodeTypesMappingFile();
            failWriteStream = false;
            expect(console.log).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith(
                "Error while updating the node mappings. Cancel update...",
            );
            expect(console.error).toHaveBeenCalledWith(
                new Error("Error while writing the changelog:\nError: write?? not here!!"),
            );

            vi.clearAllMocks();

            vi.spyOn(fs, "readFile").mockResolvedValue("[]");
            vi.spyOn(fs, "writeFile").mockRejectedValueOnce(new Error("☹"));
            await updateNodeTypesMappingFile();
            expect(console.log).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenCalledWith("Error while writing nodeTypesConfig.json");
            expect(console.error).toHaveBeenCalledWith(new Error("☹"));
        });

        it("should update node types mapping file correctly and write changelog", async () => {
            mockConsole();
            vi.spyOn(fs, "readFile").mockImplementation((path) => {
                let nodeTypes: NodeTypes = [];
                switch (path) {
                    case "./node_modules/tree-sitter-c-sharp/src/node-types.json":
                        nodeTypes = [
                            { type: "class_declaration", named: true },
                            { type: "!", named: false },
                            {
                                type: "binary_expression",
                                named: true,
                                fields: {
                                    left: {
                                        multiple: false,
                                        required: true,
                                        types: [{ type: "_expression", named: true }],
                                    },
                                    operator: {
                                        multiple: false,
                                        required: true,
                                        types: [{ type: "!=", named: false }],
                                    },
                                    right: {
                                        multiple: false,
                                        required: true,
                                        types: [{ type: "_expression", named: true }],
                                    },
                                },
                            },
                        ];
                        break;
                    case "./node_modules/tree-sitter-java/src/node-types.json":
                        nodeTypes = [
                            { type: "class_declaration", named: true },
                            {
                                type: "comment",
                                named: true,
                                subtypes: [
                                    { type: "block_comment", named: true },
                                    { type: "line_comment", named: true },
                                ],
                            },
                        ];
                        break;
                    case "./node_modules/tree-sitter-javascript/src/node-types.json":
                        nodeTypes = [
                            { type: "class_declaration", named: true },
                            { type: "lambda_expression", named: true },
                        ];
                        break;
                }
                return Promise.resolve(JSON.stringify(nodeTypes));
            });
            vi.spyOn(fs, "writeFile").mockResolvedValueOnce();
            vi.doMock("../../parser/config/nodeTypesConfig.json", () => ({
                default: [
                    {
                        type_name: "class_declaration",
                        category: "class_definition",
                        languages: ["cs", "java"],
                    },
                    {
                        type_name: "constructor_declaration",
                        category: "function",
                        languages: ["cs", "java"],
                    },
                    {
                        type_name: "conversion_operator_declaration",
                        category: "",
                        languages: ["cs"],
                    },
                    {
                        type_name: "lambda_expression",
                        category: "function",
                        deactivated_for_languages: ["cpp"],
                        languages: ["cs", "java", "cpp"],
                    },
                    {
                        type_name: "binary_expression_!=",
                        deactivated_for_languages: ["cpp", "cs"],
                        category: "binary_expression",
                        languages: ["cs", "java", "cpp"],
                        grammar_type_name: "binary_expression",
                        operator: "!=",
                    },
                ],
            }));

            const { updateNodeTypesMappingFile } = await import("./ImportNodeTypes.js");
            await updateNodeTypesMappingFile();

            expect(vi.mocked(fs.writeFile).mock.calls).toMatchSnapshot();
            expect(changelog).toMatchSnapshot();
            expect(vi.mocked(console.warn).mock.calls).toMatchSnapshot();
        });
    });
});
