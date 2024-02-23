import CSharp from "tree-sitter-c-sharp";
import CPlusPlus from "tree-sitter-cpp";
import GO from "tree-sitter-go";
import Java from "tree-sitter-java";
import JavaScript from "tree-sitter-javascript";
import Kotlin from "tree-sitter-kotlin";
import PHP from "tree-sitter-php";
import Python from "tree-sitter-python";
import TypeScript from "tree-sitter-typescript";
import Ruby from "tree-sitter-ruby";
import Rust from "tree-sitter-rust";
import Bash from "tree-sitter-bash";
import { ConstantTwoWayMap } from "./ConstantTwoWayMap";

/**
 * Enum of all supported programming languages.
 */
export const enum Language {
    CSharp,
    CPlusPlus,
    Go,
    Java,
    JavaScript,
    Kotlin,
    PHP,
    TypeScript,
    TSX,
    Python,
    Ruby,
    Rust,
    Bash,
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
export const languageToAbbreviation = new ConstantTwoWayMap<Language, string>(
    new Map([
        [Language.CSharp, "cs"],
        [Language.CPlusPlus, "cpp"],
        [Language.Go, "go"],
        [Language.Java, "java"],
        [Language.JavaScript, "js"],
        [Language.Kotlin, "kt"],
        [Language.PHP, "php"],
        [Language.TypeScript, "ts"],
        [Language.TSX, "tsx"],
        [Language.Python, "py"],
        [Language.Ruby, "rb"],
        [Language.Rust, "rs"],
        [Language.Bash, "sh"],
        [Language.Unknown, "N/A"],
    ])
);

/**
 * Maps from a language to the corresponding tree-sitter grammar.
 */
export const languageToGrammar = new Map([
    [Language.CSharp, CSharp],
    [Language.CPlusPlus, CPlusPlus],
    [Language.Go, GO],
    [Language.Java, Java],
    [Language.JavaScript, JavaScript],
    [Language.Kotlin, Kotlin],
    [Language.PHP, PHP.php],
    [Language.TypeScript, TypeScript.typescript],
    [Language.TSX, TypeScript.tsx],
    [Language.Python, Python],
    [Language.Ruby, Ruby],
    [Language.Rust, Rust],
    [Language.Bash, Bash],
]);

/**
 * Maps supported file extensions to the corresponding programming languages.
 */
export const fileExtensionToLanguage = new Map([
    ["cs", Language.CSharp],
    ["cpp", Language.CPlusPlus],
    ["cp", Language.CPlusPlus],
    ["cxx", Language.CPlusPlus],
    ["cc", Language.CPlusPlus],
    ["h", Language.CPlusPlus],
    ["hpp", Language.CPlusPlus],
    ["hxx", Language.CPlusPlus],
    ["hh", Language.CPlusPlus],
    ["go", Language.Go],
    ["java", Language.Java],
    ["js", Language.JavaScript],
    ["kt", Language.Kotlin],
    ["php", Language.PHP],
    ["ts", Language.TypeScript],
    ["tsx", Language.TSX],
    ["py", Language.Python],
    ["rb", Language.Ruby],
    ["rs", Language.Rust],
    ["sh", Language.Bash],
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
