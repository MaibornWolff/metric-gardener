import GO from "tree-sitter-go";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import TypeScript from "tree-sitter-typescript";

export const grammars = new Map([
    ["GO", GO],
    ["Kotlin", Kotlin],
    ["PHP", PHP],
    ["TypeScript", TypeScript.typescript],
]);

export const filesToParse: Map<string, ParseFile> = new Map([
    ["GO", { language: "GO", filePath: "./resources/go-example-code.go" }],
    [
        "Kotlin",
        { language: "Kotlin", filePath: "./resources/kotlin-example-code.kt" },
    ],
    ["PHP", { language: "PHP", filePath: "./resources/php-example-code.php" }],
    [
        "TypeScript",
        { language: "TypeScript", filePath: "./resources/js-example-code.ts" },
    ],
]);
