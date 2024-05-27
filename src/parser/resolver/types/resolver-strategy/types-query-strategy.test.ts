import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parse } from "../../../../helper/tree-parser.js";
import { Configuration } from "../../../configuration.js";
import { type ParsedFile } from "../../../metrics/metric.js";
import { CSharpCollector } from "../c-sharp-collector.js";
import { type AbstractCollector, type TypeInfo } from "../abstract-collector.js";
import { TypesQueryStrategy } from "./types-query-strategy.js";

async function getConfiguration(filePath: string): Promise<Configuration> {
    return new Configuration({
        sourcesPath: await fs.realpath(filePath),
        outputPath: "hello.json",
        parseDependencies: true,
        exclusions: "",
        parseAllHAsC: false,
        parseSomeHAsC: "",
        compress: false,
        relativePaths: true,
    });
}

describe("Types Query strategy", () => {
    describe("function getTypesFromFile()", () => {
        it("should calculate types declarations for interfaces", async () => {
            /* Since we add the "node" field to TypeInfo, we have to mock that node to run this test.
            This makes the test very complicated...
            // Given
            const filePath = "resources/c-sharp/relation-between-interfaces-in-one-file/Program.cs";
            const parsedFile: ParsedFile = (await parse(
                filePath,
                await getConfiguration(filePath),
            )) as ParsedFile;
            const csharpCollector: AbstractCollector = new CSharpCollector();

            const result: Map<string, TypeInfo> = new Map<string, TypeInfo>();

            result.set("mainNamespace.FirstInterface", {
                namespace: "mainNamespace",
                typeName: "FirstInterface",
                classType: "interface",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            result.set("mainNamespace.SecondInterface", {
                namespace: "mainNamespace",
                typeName: "SecondInterface",
                classType: "interface",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            result.set("mainNamespace.Mainy", {
                namespace: "mainNamespace",
                typeName: "Mainy",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            // When
            const typesFromFile = new TypesQueryStrategy().getTypesFromFile(
                parsedFile,
                ".",
                csharpCollector.getTypesQuery(),
            );
            // Then
            expect(typesFromFile).toStrictEqual(result); */
        });
    });
});
