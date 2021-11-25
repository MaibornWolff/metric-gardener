import fs from "fs";
import { grammars } from "./Grammars";
import Parser, { Tree } from "tree-sitter";

export class TreeParser {
    private static cache: Map<string, Tree> = new Map();

    static getParseTree(parseFile: ParseFile): Tree {
        if (TreeParser.cache.has(parseFile.filePath)) {
            return TreeParser.cache.get(parseFile.filePath);
        }

        const parser = new Parser();
        parser.setLanguage(grammars.get(parseFile.language));

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);

        TreeParser.cache.set(parseFile.filePath, tree);

        return tree;
    }
}
