import fs from "fs";
import { fileExtensionToGrammar } from "./FileExtensionToGrammar";
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
        parser.setLanguage(fileExtensionToGrammar.get(parseFile.fileExtension));

        // As toString() without parameter uses UTF-8, using UTF-8 while reading the file doesn't change the result:
        const sourceCode = fs.readFileSync(parseFile.filePath, { encoding: "utf8" });
        const tree = parser.parse(sourceCode);

        TreeParser.cache.set(parseFile.filePath, tree);

        return tree;
    }

    static async getParseTreeAsync(parseFile: ParseFile): Promise<Tree> {
        const cachedItem = TreeParser.cache.get(parseFile.filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const parser = new Parser();
        parser.setLanguage(fileExtensionToGrammar.get(parseFile.fileExtension));

        // As toString() without parameter uses UTF-8, using UTF-8 while reading the file doesn't change the result:
        const sourceCode = await fs.promises.readFile(parseFile.filePath, { encoding: "utf8" }); //.toString();
        const tree = parser.parse(sourceCode);

        TreeParser.cache.set(parseFile.filePath, tree);

        return tree;
    }
}
