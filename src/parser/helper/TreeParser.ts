import fs from "fs/promises";
import { readFileSync } from "fs";
import { assumeLanguageFromFilePath, Language, languageToGrammar } from "./Language.js";
import Parser = require("tree-sitter");
import { ErrorFile, ParsedFile, SourceFile, UnsupportedFile } from "../metrics/Metric.js";
import { Configuration } from "../Configuration.js";

export class TreeParser {
    private static cache: Map<string, SourceFile> = new Map();

    static parseSync(filePath: string, config: Configuration): ParsedFile | UnsupportedFile {
        const cachedItem = TreeParser.cache.get(filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const sourceCode = readFileSync(filePath, { encoding: "utf8" });
        return this.#parseTree(sourceCode, filePath, config);
    }

    /**
     * Parses the specified file if it is written in a supported language.
     * @param filePath Path of the file.
     * @param config Configuration to apply.
     * @return A {@link ParsedFile} if the language is supported, an {@link UnsupportedFile} otherwise.
     */
    static async parse(
        filePath: string,
        config: Configuration,
    ): Promise<ParsedFile | UnsupportedFile> {
        const cachedItem = TreeParser.cache.get(filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        try {
            const sourceCode = await fs.readFile(filePath, { encoding: "utf8" });
            return this.#parseTree(sourceCode, filePath, config);
        } catch (error) {
            return new ErrorFile(filePath, error);
        }
    }

    static #parseTree(
        sourceCode: string,
        filePath: string,
        config: Configuration,
    ): ParsedFile | UnsupportedFile {
        let language = assumeLanguageFromFilePath(filePath, config);

        if (language === undefined) {
            // Unsupported file language, return
            const unsupportedFile = new UnsupportedFile(filePath);
            TreeParser.cache.set(filePath, unsupportedFile);
            return unsupportedFile;
        }

        if (language === Language.JavaScript) {
            // Check if this is actually flow-annotated code instead of plain JavaScript. Use the TSX-grammar then.
            // See https://flow.org/en/docs/usage/#toc-prepare-your-code-for-flow on how to identify them.
            // See https://github.com/tree-sitter/tree-sitter-typescript/tree/v0.20.5 on using the TSX-grammar
            // for flow-annotated files.
            if (sourceCode.match(/^(\/\*[\s*]*@flow)|(\/\/\s*@flow)/) !== null) {
                language = Language.TSX;
            }
        }

        const parser = new Parser();
        parser.setLanguage(languageToGrammar.get(language));

        const tree = parser.parse(sourceCode);

        if (tree === undefined) {
            throw new Error("Syntax tree for file " + filePath + " is undefined!");
        }
        if (tree.rootNode === undefined) {
            throw new Error("Root node of syntax tree for file " + filePath + " is undefined!");
        }

        const parsedFile = new ParsedFile(filePath, language, tree);
        TreeParser.cache.set(filePath, parsedFile);

        return parsedFile;
    }
}
