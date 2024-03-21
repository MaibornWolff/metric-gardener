// @ts-expect-error module doesn't have types
import CSharp from "tree-sitter-c-sharp";
// @ts-expect-error module doesn't have types
import CPlusPlus from "tree-sitter-cpp";
// @ts-expect-error module doesn't have types
import GO from "tree-sitter-go";
// @ts-expect-error module doesn't have types
import Java from "tree-sitter-java";
// @ts-expect-error module doesn't have types
import JavaScript from "tree-sitter-javascript";
// @ts-expect-error module doesn't have types
import Kotlin from "tree-sitter-kotlin";
// @ts-expect-error module doesn't have types
import PHP from "tree-sitter-php";
// @ts-expect-error module doesn't have types
import Python from "tree-sitter-python";
// @ts-expect-error module doesn't have types
import TypeScript from "tree-sitter-typescript";
// @ts-expect-error module doesn't have types
import Ruby from "tree-sitter-ruby";
// @ts-expect-error module doesn't have types
import Rust from "tree-sitter-rust";
// @ts-expect-error module doesn't have types
import Bash from "tree-sitter-bash";
// @ts-expect-error module doesn't have types
import C from "tree-sitter-c";
// @ts-expect-error module doesn't have types
import JSON from "tree-sitter-json";
// @ts-expect-error module doesn't have types
import YAML from "tree-sitter-yaml";
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
    YAML,
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
        [Language.YAML, "yaml"],
    ]),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [Language.PHP, PHP.php],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [Language.TypeScript, TypeScript.typescript],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [Language.TSX, TypeScript.tsx],
    [Language.Python, Python],
    [Language.Ruby, Ruby],
    [Language.Rust, Rust],
    [Language.Bash, Bash],
    [Language.C, C],
    [Language.JSON, JSON],
    [Language.YAML, YAML],
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
    ["yaml", Language.YAML],
    ["yml", Language.YAML],
]);

export const enum FileType {
    SourceCode = "source_code",
    StructuredText = "structured_text",
    Unsupported = "unsupported_file",
    Error = "error_file",
}

/**
 * Set of structured text languages.
 */
export const structuredTextLanguages = new Set([Language.JSON, Language.YAML]);

export function languageToFileType(language: Language) {
    return structuredTextLanguages.has(language) ? FileType.StructuredText : FileType.SourceCode;
}

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
        // Use the path relative to the sources path to avoid the unintuitive behavior
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
export function fileExtensionToGrammar(fileExtension: string): unknown {
    const language = fileExtensionToLanguage.get(fileExtension);
    if (language !== undefined) {
        return languageToGrammar.get(language);
    } else {
        return undefined;
    }
}
