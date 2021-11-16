import fs from "fs";
import { grammars } from "../grammars";
import Parser, { Tree } from "tree-sitter";

export class TreeParser {
    private treeCache: Map<string, Tree> = new Map();

    getParseTree(parseFile: ParseFile): Tree {
        if (this.treeCache.has(parseFile.filePath)) {
            return this.treeCache.get(parseFile.filePath);
        }

        const parser = new Parser();
        parser.setLanguage(grammars.get(parseFile.language));

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);
        this.treeCache.set(parseFile.filePath, tree);

        return tree;
    }
}
