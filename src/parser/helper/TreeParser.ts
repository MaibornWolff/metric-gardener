import fs from "fs";
import { Language, languageToGrammar } from "./Language";
import Parser, { Tree } from "tree-sitter";
import { ParseFile } from "../metrics/Metric";

export class TreeParser {
    private static cache: Map<string, Tree> = new Map();

    static getParseTree(parseFile: ParseFile): Tree {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined && cachedItem.rootNode !== undefined) {
            return cachedItem;
        }

        const sourceCode = fs.readFileSync(parseFile.filePath, { encoding: "utf8" });

        return TreeParser.parse(sourceCode, parseFile);
    }

    static async getParseTreeAsync(parseFile: ParseFile): Promise<Tree> {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined && cachedItem.rootNode !== undefined) {
            return cachedItem;
        }

        const sourceCode = await fs.promises.readFile(parseFile.filePath, { encoding: "utf8" });

        return TreeParser.parse(sourceCode, parseFile);
    }

    private static parse(sourceCode: string, parseFile: ParseFile) {
        let grammarLanguage = parseFile.language;

        if (grammarLanguage === Language.JavaScript) {
            // Check if this is actually flow-annotated code instead of plain JavaScript. Use the TSX-grammar then.
            // See https://flow.org/en/docs/usage/#toc-prepare-your-code-for-flow on how to identify them.
            // See https://github.com/tree-sitter/tree-sitter-typescript/tree/v0.20.5 on using the TSX-grammar
            // for flow-annotated files.
            if (sourceCode.match(/^.*@flow/) !== null) {
                grammarLanguage = Language.TSX;
            }
        }

        const parser = new Parser();
        parser.setLanguage(languageToGrammar.get(parseFile.language));

        const tree = parser.parse(sourceCode);

        if (tree === undefined) {
            throw new Error("Syntax tree for file " + parseFile.filePath + " is undefined!");
        }
        if (tree.rootNode === undefined) {
            throw new Error(
                "Root node of syntax tree for file " + parseFile.filePath + " is undefined!"
            );
        }

        TreeParser.cache.set(parseFile.filePath, tree);

        return tree;
    }
}
