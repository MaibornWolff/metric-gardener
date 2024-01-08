import fs from "fs";
import { fileExtensionToGrammar } from "./Languages";
import Parser, { Tree } from "tree-sitter";
import { ParseFile } from "../metrics/Metric";

export class TreeParser {
    private static cache: Map<string, Tree> = new Map();

    static getParseTree(parseFile: ParseFile): Tree {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const parser = new Parser();
        parser.setLanguage(fileExtensionToGrammar(parseFile.fileExtension));

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);

        TreeParser.cache.set(parseFile.filePath, tree);

        return tree;
    }
}
