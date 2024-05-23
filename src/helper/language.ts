import path from "node:path";
import CSharp from "tree-sitter-c-sharp";
import CPlusPlus from "tree-sitter-cpp";
import GO from "tree-sitter-go";
import Java from "tree-sitter-java";
import JavaScript from "tree-sitter-javascript";
import Kotlin from "tree-sitter-kotlin";
import phpTreesitterConfig from "tree-sitter-php";
import Python from "tree-sitter-python";
import TSTreesitterConfig from "tree-sitter-typescript";
import Ruby from "tree-sitter-ruby";
import Rust from "tree-sitter-rust";
import Bash from "tree-sitter-bash";
import C from "tree-sitter-c";
import JSON from "tree-sitter-json";
import YAML from "tree-sitter-yaml";
import { type Configuration } from "../parser/configuration.js";
import { lookupLowerCase } from "./helper.js";

/**
 * Note that this is not necessarily identical to the file extension of a file of the corresponding language,
 * as there can be multiple file extensions for one language.
 * Use {@link fileExtensionToLanguage} for mapping file extensions.
 */
export const Language = {
    CSharp: "cs",
    CPlusPlus: "cpp",
    Go: "go",
    Java: "java",
    JavaScript: "js",
    Kotlin: "kt",
    PHP: "php",
    TypeScript: "ts",
    TSX: "tsx",
    Python: "py",
    Ruby: "rb",
    Rust: "rs",
    Bash: "sh",
    C: "c",
    JSON: "json",
    YAML: "yaml",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Language = (typeof Language)[keyof typeof Language];

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
    [Language.PHP, phpTreesitterConfig.php],
    [Language.TypeScript, TSTreesitterConfig.typescript],
    [Language.TSX, TSTreesitterConfig.tsx],
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

export const FileType = {
    SourceCode: "source_code",
    StructuredText: "structured_text",
    Unsupported: "unsupported_file",
    Error: "error_file",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FileType = (typeof FileType)[keyof typeof FileType];

/**
 * Set of structured text languages.
 */
export const structuredTextLanguages = new Set<Language>([Language.JSON, Language.YAML]);

export function languageToFileType(language: Language): FileType {
    return structuredTextLanguages.has(language) ? FileType.StructuredText : FileType.SourceCode;
}

/**
 * Maps supported file extensions to the corresponding programming languages.
 * For case-sensitive file extensions.
 */
const caseSensitiveFileExtensionToLanguage = new Map([
    ["c", Language.C],
    ["C", Language.CPlusPlus],
    ["H", Language.CPlusPlus], // Lowercase .h has a special treatment
]);

/**
 * Estimates the language of a file based upon the file extension and file path.
 * @param filePath Path to the file, including the file extension.
 * @param config Configuration to apply.
 */
export function assumeLanguageFromFilePath(
    filePath: string,
    config: Configuration,
): Language | undefined {
    const fileExtension = path.extname(filePath).slice(1);

    if (fileExtension === "h") {
        if (shouldHBeParsedAsC(filePath, config)) {
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
function shouldHBeParsedAsC(filePath: string, config: Configuration): boolean {
    if (config.parseAllHAsC) {
        return true;
    }

    if (config.parseSomeHAsC.size > 0) {
        // Use the path relative to the sources path to avoid the unintuitive behavior
        // that higher-level folders are evaluated for this:
        const relativePath = path.relative(config.sourcesPath, filePath);
        for (const pathElement of relativePath.split(path.sep)) {
            if (config.parseSomeHAsC.has(pathElement)) {
                return true;
            }
        }
    }

    return false;
}
