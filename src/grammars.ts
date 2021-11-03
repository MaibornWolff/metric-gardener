import GO from "tree-sitter-go";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import TypeScript from "tree-sitter-typescript";

export const grammars = new Map([
    ["go", GO],
    ["kt", Kotlin],
    ["php", PHP],
    ["ts", TypeScript.typescript],
]);
