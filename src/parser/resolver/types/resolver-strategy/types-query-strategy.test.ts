import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parse } from "../../../../helper/tree-parser.js";
import { Configuration } from "../../../configuration.js";
import { type ParsedFile } from "../../../metrics/metric.js";
import { CSharpCollector } from "../c-sharp-collector.js";
import { type AbstractCollector, type TypeInfo } from "../abstract-collector.js";
import { PHPCollector } from "../php-collector.js";
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
            // Given
            const filePath = "resources/c-sharp/relation-between-interfaces-in-one-file/Program.cs";
            const parsedFile: ParsedFile = (await parse(
                filePath,
                await getConfiguration(filePath),
            )) as ParsedFile;
            const csharpCollector: AbstractCollector = new CSharpCollector();

            const result: Map<FullyQualifiedName, TypeInfo> = new Map<string, TypeInfo>();

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
            const typesFromFile: Map<FullyQualifiedName, TypeInfo> =
                new TypesQueryStrategy().getTypesFromFile(
                    parsedFile,
                    ".",
                    csharpCollector.getTypesQuery(),
                );
            // Then
            for (const [key, value] of typesFromFile.entries()) {
                expect(value).toEqual(expect.objectContaining(result.get(key)));
            }
        });

        it("should calculate correct types from multiple namespaces within one file for c-sharp", async () => {
            // Given
            const filePath = "resources/c-sharp/coupling-examples/BlubController.cs";
            const parsedFile: ParsedFile = (await parse(
                filePath,
                await getConfiguration(filePath),
            )) as ParsedFile;
            const csharpCollector: AbstractCollector = new CSharpCollector();

            const result: Map<FullyQualifiedName, TypeInfo> = new Map<string, TypeInfo>();

            result.set("App.CouplingExamplesOne.BlubControllerOne1", {
                namespace: "App.CouplingExamplesOne",
                typeName: "BlubControllerOne1",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            result.set("App.CouplingExamplesOne.BlubControllerOne2", {
                namespace: "App.CouplingExamplesOne",
                typeName: "BlubControllerOne2",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            result.set("App.CouplingExamplesTwo.BlubControllerTwo1", {
                namespace: "App.CouplingExamplesTwo",
                typeName: "BlubControllerTwo1",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: ".",
                implementedFrom: [],
            });
            result.set("App.CouplingExamplesTwo.BlubControllerTwo2", {
                namespace: "App.CouplingExamplesTwo",
                typeName: "BlubControllerTwo2",
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
            for (const [key, value] of typesFromFile.entries()) {
                expect(value).toEqual(expect.objectContaining(result.get(key)));
            }
        });

        it("should calculate correct types from multiple namespaces within one file for php", async () => {
            // Given
            const filePath = "resources/php/coupling-examples/BlubController.php";
            const parsedFile: ParsedFile = (await parse(
                filePath,
                await getConfiguration(filePath),
            )) as ParsedFile;
            const phpCollector: PHPCollector = new PHPCollector();

            const result: Map<FullyQualifiedName, TypeInfo> = new Map<string, TypeInfo>();

            result.set("App\\CouplingExamplesOne\\BlubControllerOne1", {
                namespace: "App\\CouplingExamplesOne",
                typeName: "BlubControllerOne1",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: "\\",
                implementedFrom: ["ControllerInterface"],
            });
            result.set("App\\CouplingExamplesOne\\BlubControllerOne2", {
                namespace: "App\\CouplingExamplesOne",
                typeName: "BlubControllerOne2",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: "\\",
                implementedFrom: [],
            });
            result.set("App\\CouplingExamplesTwo\\BlubControllerTwo1", {
                namespace: "App\\CouplingExamplesTwo",
                typeName: "BlubControllerTwo1",
                classType: "class",
                sourceFile: filePath,
                namespaceDelimiter: "\\",
                extendedFrom: "BlubControllerOne1",
                implementedFrom: [],
            });

            // When
            const typesFromFile = new TypesQueryStrategy().getTypesFromFile(
                parsedFile,
                "\\",
                phpCollector.getTypesQuery(),
            );
            // Then
            for (const [key, value] of typesFromFile.entries()) {
                expect(value).toEqual(expect.objectContaining(result.get(key)));
            }
        });
    });
});
