import CSharp from "tree-sitter-c-sharp";
import CPlusPlus from "tree-sitter-cpp";
import GO from "tree-sitter-go";
import Java from "tree-sitter-java";
import JavaScript from "tree-sitter-javascript";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import Python from "tree-sitter-python";
import TypeScript from "tree-sitter-typescript";

/**
 * Maps supported file extensions to the corresponding language grammar.
 */
export const fileExtensionToGrammar = new Map([
    ["cs", CSharp],
    ["cpp", CPlusPlus],
    ["h", CPlusPlus],
    ["go", GO],
    ["java", Java],
    ["js", JavaScript],
    ["kt", Kotlin],
    ["php", PHP],
    ["ts", TypeScript.typescript],
    ["py", Python],
]);
