import CSharp from "tree-sitter-c-sharp";
import CPlusPlus from "tree-sitter-cpp";
import GO from "tree-sitter-go";
import Java from "tree-sitter-java";
import JavaScript from "tree-sitter-javascript";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import Python from "tree-sitter-python";
import TypeScript from "tree-sitter-typescript";
import { ConstantTwoWayMap } from "./ConstantTwoWayMap";

/**
 * Enum of all supported programming languages.
 */
export const enum Languages {
    CSharp,
    CPlusPlus,
    Go,
    Java,
    JavaScript,
    Kotlin,
    PHP,
    TypeScript,
    Python,
    /**
     * For files with unknown file extension. Could be a source code file written in language(s) for which
     * no tree sitter grammar is installed, a missing entry in {@link fileExtensionToLanguage}
     * or just a file that is no source code.
     */
    Unknown,
}

/**
 * Maps back and forth between language and an abbreviation as string value.
 * The string value corresponding to the language is equivalent to the abbreviation used in the node mappings file.
 *
 * Note that this is not necessarily identical to the file extension of a file of the corresponding language,
 * as there can be multiple file extensions for one language. Use {@link fileExtensionToLanguage}
 * or {@link fileExtensionToGrammar} for mapping file extensions.
 */
export const languageToAbbreviation = new ConstantTwoWayMap<Languages, string>(
    new Map([
        [Languages.CSharp, "cs"],
        [Languages.CPlusPlus, "cpp"],
        [Languages.Go, "go"],
        [Languages.Java, "java"],
        [Languages.JavaScript, "js"],
        [Languages.Kotlin, "kt"],
        [Languages.PHP, "php"],
        [Languages.TypeScript, "ts"],
        [Languages.Python, "py"],
        [Languages.Unknown, "N/A"],
    ])
);

/**
 * Maps from a language to the corresponding tree-sitter grammar.
 */
export const languageToGrammar = new Map([
    [Languages.CSharp, CSharp],
    [Languages.CPlusPlus, CPlusPlus],
    [Languages.Go, GO],
    [Languages.Java, Java],
    [Languages.JavaScript, JavaScript],
    [Languages.Kotlin, Kotlin],
    [Languages.PHP, PHP],
    [Languages.TypeScript, TypeScript.typescript],
    [Languages.Python, Python],
]);

/**
 * Maps supported file extensions to the corresponding programming languages.
 */
export const fileExtensionToLanguage = new Map([
    ["cs", Languages.CSharp],
    ["cpp", Languages.CPlusPlus],
    ["h", Languages.CPlusPlus],
    ["cc", Languages.CPlusPlus],
    ["hpp", Languages.CPlusPlus],
    ["go", Languages.Go],
    ["java", Languages.Java],
    ["js", Languages.JavaScript],
    ["kt", Languages.Kotlin],
    ["php", Languages.PHP],
    ["ts", Languages.TypeScript],
    ["py", Languages.Python],
]);

/**
 * Maps supported file extensions to the corresponding language grammar.
 * @param fileExtension The file extension to map.
 * @return The corresponding grammar if the file extension is supported, undefined otherwise.
 */
export function fileExtensionToGrammar(fileExtension: string) {
    const language = fileExtensionToLanguage.get(fileExtension);
    if (language !== undefined) {
        return languageToGrammar.get(language);
    } else {
        return undefined;
    }
}
