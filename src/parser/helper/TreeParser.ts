import fs from "fs";
import { languageToGrammar } from "./Language";
import Parser, { Tree } from "tree-sitter";
import { ParseFile } from "../metrics/Metric";

export class TreeParser {
    private static cache: Map<string, Tree> = new Map();

    static getParseTree(parseFile: ParseFile): Tree {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined && cachedItem.rootNode !== undefined) {
            return cachedItem;
        }

        const parser = new Parser();
        parser.setLanguage(languageToGrammar.get(parseFile.language));

        const sourceCode = fs.readFileSync(parseFile.filePath, { encoding: "utf8" });
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

        if (tree === undefined || tree.rootNode === undefined) {
            console.error("Error: syntax tree for file " + parseFile.filePath + " is empty!");
            throw new Error("Error: syntax tree for file " + parseFile.filePath + " is empty!");
        }

        return tree;
    }

    static async getParseTreeAsync(parseFile: ParseFile): Promise<Tree> {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined && cachedItem.rootNode !== undefined) {
            return cachedItem;
        }

        const parser = new Parser();
        parser.setLanguage(languageToGrammar.get(parseFile.language));

        const sourceCode = await fs.promises.readFile(parseFile.filePath, { encoding: "utf8" });
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
