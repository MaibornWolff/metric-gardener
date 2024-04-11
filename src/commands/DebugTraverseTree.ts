import * as fs from "node:fs";
import Parser = require("tree-sitter");
import { type TreeCursor } from "tree-sitter";
import { Language, languageToGrammar } from "../parser/helper/Language.js";

if (require.main === module) {
    traverseTree("./resources/c++/TEST.hpp", Language.CPlusPlus);
}

/**
 * Traverses the syntax tree of a file depth-first and prints all encountered nodes.
 * FOR DEBUGGING PURPOSES ONLY.
 * @param filePath Path to the file.
 * @param language Language to use for parsing.
 */
export function traverseTree(filePath: string, language: Language): void {
    const text: string = fs.readFileSync(filePath, { encoding: "utf8" });

    const parser = new Parser();
    parser.setLanguage(languageToGrammar.get(language));

    const tree = parser.parse(text);

    walkTree(tree.walk());
}

function walkTree(cursor: TreeCursor): void {
    const { currentNode } = cursor;
    console.log(currentNode);

    // Recurse, depth-first
    if (cursor.gotoFirstChild()) {
        walkTree(cursor);
    }

    if (cursor.gotoNextSibling()) {
        walkTree(cursor);
    } else {
        // Completed searching this part of the tree, so go up now.
        cursor.gotoParent();
    }
}
