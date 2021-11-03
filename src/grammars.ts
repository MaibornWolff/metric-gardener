import CSharp from "tree-sitter-c-sharp";
import GO from "tree-sitter-go";
import Java from "tree-sitter-java";
import JavaScript from "tree-sitter-javascript";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import TypeScript from "tree-sitter-typescript";

export const grammars = new Map([
    ["cs", CSharp],
    ["go", GO],
    ["java", Java],
    ["js", JavaScript],
    ["kt", Kotlin],
    ["php", PHP],
    ["ts", TypeScript.typescript],
]);
