import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import Parser = require("tree-sitter");
import { ErrorFile, ParsedFile, type SourceFile, UnsupportedFile } from "../metrics/Metric.js";
import { type Configuration } from "../Configuration.js";
import { assumeLanguageFromFilePath, Language, languageToGrammar } from "./Language.js";

const cache = new Map<string, SourceFile>();

export function parseSync(filePath: string, config: Configuration): ParsedFile | UnsupportedFile {
    const cachedItem = cache.get(filePath);
    if (cachedItem !== undefined) {
        return cachedItem;
    }

    const sourceCode = readFileSync(filePath, { encoding: "utf8" });
    return parseTree(sourceCode, filePath, config);
}

/**
 * Parses the specified file if it is written in a supported language.
 * @param filePath Path of the file.
 * @param config Configuration to apply.
 * @return A {@link ParsedFile} if the language is supported, an {@link UnsupportedFile} otherwise.
 * If an error occurs while reading the file, an {@link ErrorFile} is returned.
 */
export async function parse(filePath: string, config: Configuration): Promise<SourceFile> {
    const cachedItem = cache.get(filePath);
    if (cachedItem !== undefined) {
        return cachedItem;
    }

    try {
        const sourceCode = await fs.readFile(filePath, { encoding: "utf8" });
        return parseTree(sourceCode, filePath, config);
    } catch (error) {
        return new ErrorFile(filePath, error instanceof Error ? error : new Error(String(error)));
    }
}

function parseTree(
    sourceCode: string,
    filePath: string,
    config: Configuration,
): ParsedFile | UnsupportedFile {
    let language = assumeLanguageFromFilePath(filePath, config);

    if (language === undefined) {
        // Unsupported file language, return
        const unsupportedFile = new UnsupportedFile(filePath);
        cache.set(filePath, unsupportedFile);
        return unsupportedFile;
    }

    // Check if this is actually flow-annotated code instead of plain JavaScript. Use the TSX-grammar then.
    // See https://flow.org/en/docs/usage/#toc-prepare-your-code-for-flow on how to identify them.
    // See https://github.com/tree-sitter/tree-sitter-typescript/tree/v0.20.5 on using the TSX-grammar
    // for flow-annotated files.
    if (
        language === Language.JavaScript &&
        /^(\/\*[\s*]*@flow)|(\/\/\s*@flow)/.exec(sourceCode) !== null
    ) {
        language = Language.TSX;
    }

    const parser = new Parser();
    parser.setLanguage(languageToGrammar.get(language));
    const tree = parser.parse(sourceCode);

    const parsedFile = new ParsedFile(filePath, language, tree);
    cache.set(filePath, parsedFile);
    return parsedFile;
}
