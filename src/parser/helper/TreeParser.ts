import fs from "fs";
import { Language, languageToGrammar } from "./Language";
import Parser from "tree-sitter";
import { ParsedFile, SimpleFile } from "../metrics/Metric";

export class TreeParser {
    private static cache: Map<string, ParsedFile> = new Map();

    static parseSync(file: SimpleFile, assumedLanguage: Language): ParsedFile {
        const cachedItem = TreeParser.cache.get(file.filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const sourceCode = fs.readFileSync(file.filePath, { encoding: "utf8" });
        return this.#parseTree(sourceCode, file, assumedLanguage);
    }

    static async parse(file: SimpleFile, assumedLanguage: Language): Promise<ParsedFile> {
        const cachedItem = TreeParser.cache.get(file.filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const sourceCode = await fs.promises.readFile(file.filePath, { encoding: "utf8" });
        return this.#parseTree(sourceCode, file, assumedLanguage);
    }

    static #parseTree(sourceCode: string, file: SimpleFile, language: Language): ParsedFile {
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
            throw new Error("Syntax tree for file " + file.filePath + " is undefined!");
        }
        if (tree.rootNode === undefined) {
            throw new Error(
                "Root node of syntax tree for file " + file.filePath + " is undefined!",
            );
        }

        const parsedFile = {
            filePath: file.filePath,
            fileExtension: file.fileExtension,
            language: language,
            tree: tree,
        };

        TreeParser.cache.set(file.filePath, parsedFile);

        return parsedFile;
    }
}
