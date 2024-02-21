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
import C from "tree-sitter-c";
import JSON from "tree-sitter-json";
import { ConstantTwoWayMap } from "./ConstantTwoWayMap";
import { Configuration } from "../Configuration";
import { getFileExtension, lookupLowerCase, replaceForwardWithBackwardSlashes } from "./Helper";
import path from "path";

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
    C,
    JSON,
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
        [Language.C, "c"],
        [Language.JSON, "json"],
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
    [Language.C, C],
    [Language.JSON, JSON],
]);

/**
 * Maps supported file extensions to the corresponding programming languages.
 * In lower case. This list is for file extensions which are not case-sensitive.
 */
const fileExtensionToLanguage = new Map([
    ["cs", Language.CSharp],
    ["cpp", Language.CPlusPlus],
    ["cp", Language.CPlusPlus],
    ["cxx", Language.CPlusPlus],
    ["cc", Language.CPlusPlus],
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
    ["json", Language.JSON],
]);

/**
 * Maps supported file extensions to the corresponding programming languages.
 * For case-sensitive file extensions.
 */
const caseSensitiveFileExtensionToLanguage = new Map([
    ["c", Language.C],
    ["C", Language.CPlusPlus],
    ["H", Language.CPlusPlus], // lowercase .h has a special treatment
]);

/**
 * Estimates the language of a file based upon the file extension and file path.
 * @param filePath Path to the file, including the file extension.
 * @param config Configuration to apply.
 * @param pathModule ONLY FOR TESTING PURPOSES: overrides the platform-specific path module.
 */
export function assumeLanguageFromFilePath(
    filePath: string,
    config: Configuration,
    pathModule = path,
) {
    const fileExtension: string = getFileExtension(filePath);

    if (fileExtension === "h") {
        if (shouldHBeParsedAsC(filePath, config, pathModule)) {
            return Language.C;
        }
        return Language.CPlusPlus;
    }

    const resultCaseSensitive = caseSensitiveFileExtensionToLanguage.get(fileExtension);
    if (resultCaseSensitive !== undefined) {
        return resultCaseSensitive;
    }
    return lookupLowerCase(fileExtensionToLanguage, fileExtension);
}

/**
 * Handling of the parse .h as C option.
 */
function shouldHBeParsedAsC(filePath: string, config: Configuration, pathModule = path): boolean {
    if (config.parseAllHAsC) {
        return true;
    }
    if (config.parseSomeHAsC.size > 0) {
        // Use the path relative to the sources path to avoid the unintuitive behaviour
        // that higher-level folders are evaluated for this:
        const relativePath = pathModule.relative(config.sourcesPath, filePath);
        const backwardSlashRelpath = replaceForwardWithBackwardSlashes(relativePath);
        const relpathSplitted = backwardSlashRelpath.split("\\");
        for (const pathElement of relpathSplitted) {
            if (config.parseSomeHAsC.has(pathElement)) {
                return true;
            }
        }
    }
    return false;
}

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
