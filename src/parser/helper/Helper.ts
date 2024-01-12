import fs from "fs";
import path from "path";
import { ExpressionMetricMapping, ExpressionQueryStatement } from "./Model";
import { ParseFile } from "../metrics/Metric";
import { fileExtensionToGrammar } from "./FileExtensionToGrammar";
import { Configuration } from "../Configuration";

export function formatCaptures(tree, captures) {
    return captures.map((c) => {
        const node = c.node;
        delete c.node;
        c.text = tree.getText(node);
        return c;
    });
}

/**
 * Similar to strcmp in C, this compares two strings and returns a negative value if a < b, a positive value if b < a,
 * and 0 if a === b.
 * @param a First string.
 * @param b Second string.
 * @return negative value if a < b, a positive value if b < a, and 0 if a === b.
 */
export function strcmp(a: string, b: string) {
    if (a < b) {
        return -1;
    } else if (b < a) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Formats the specified file path for being output in the way it is configured for this parser run.
 * @param filePath The file path.
 * @param config The configuration for this parser run.
 */
export function formatPrintPath(filePath: string, config: Configuration): string {
    let result = filePath;
    if (config.relativePaths) {
        // Returns the file path relative to the specified base directory, or the name of the file,
        // if the base path points to this single file.
        result = path.relative(config.sourcesPath, filePath);
        if (config.sourcesPath.length == 0) {
            // The path specified by the user points to a single file,
            // so return the name of the file as path to print.
            config.sourcesPath = path.basename(filePath);
        }
    }
    if (config.enforceBackwardSlash) {
        result = result.replace(/\//g, "\\");
    }
    return result;
}

/**
 * Checks whether the specified path represents a file with a file extension.
 * If so, this function returns a corresponding {@link ParseFile}-object that includes the file extension.
 * @param filePath Path that should be checked.
 * @return A ParseFile-object if there is a file extension, undefined if there is no file extension present.
 */
export function checkAndGetFileExtension(filePath: string): undefined | ParseFile {
    const splitted = filePath.split(".");
    if (splitted.length >= 2) {
        const fileExtension = splitted[splitted.length - 1].toLowerCase();
        if (fileExtension.length > 0) {
            return { fileExtension: fileExtension, filePath: filePath };
        }
    }
}

/**
 * Finds supported source code files recursively in all subdirectories.
 *
 * This is an asynchronous generator function using asynchronous I/O,
 * which means it yields values when available.
 *
 * @param config Configuration of this parser run.
 */
export async function* findFilesAsync(config: Configuration): AsyncGenerator<ParseFile> {
    try {
        // Handle special case: if the specified sourcePath is a single file, just yield the file.
        if ((await fs.promises.lstat(config.sourcesPath)).isFile()) {
            const parseFile = checkAndGetFileExtension(config.sourcesPath);
            if (parseFile !== undefined && fileExtensionToGrammar.has(parseFile.fileExtension)) {
                yield parseFile;
            }
        } else {
            // sourcePath points to a directory, so use recursive function to find all files.

            // Create set to improve lookup performance:
            const excludedSet = new Set(config.exclusions);
            // The folder at sourcePath itself cannot be excluded, so continue using delegating yield* generator call:
            yield* findFilesAsyncRecursive(config.sourcesPath, excludedSet);
        }
    } catch (e) {
        console.error(e);
    }
}

async function* findFilesAsyncRecursive(
    dir: string,
    excludedFolders: Set<string>
): AsyncGenerator<ParseFile> {
    try {
        const openedDir = await fs.promises.opendir(dir);

        for await (const currentEntry of openedDir) {
            const currentPath = path.join(dir, currentEntry.name);

            if (currentEntry.isDirectory()) {
                const isPathExcluded = excludedFolders.has(currentEntry.name);
                if (!isPathExcluded) {
                    // The current directory is not excluded, so recurse into subdirectory,
                    // using delegating yield* generator call:
                    yield* findFilesAsyncRecursive(currentPath, excludedFolders);
                }
            } // End of if (isDirectory)
            else {
                const parseFile = checkAndGetFileExtension(currentPath);
                if (
                    parseFile !== undefined &&
                    fileExtensionToGrammar.has(parseFile.fileExtension)
                ) {
                    yield parseFile;
                }
            } // End of else (isDirectory)
        } // End of for await (directory entries)
    } catch (e) {
        console.error(e);
    }
}

export function getQueryStatements(allNodeTypes: ExpressionMetricMapping[], metricName: string) {
    const statements: ExpressionQueryStatement[] = [];
    allNodeTypes.forEach((expressionMapping) => {
        if (
            expressionMapping.metrics.includes(metricName) &&
            expressionMapping.type === "statement"
        ) {
            const queryStatement = new ExpressionQueryStatement(
                expressionMapping.expression,
                expressionMapping.activated_for_languages
            );

            statements.push(queryStatement);
        }
    });
    return statements;
}

export function getExpressionsByCategory(
    allNodeTypes: ExpressionMetricMapping[],
    metricName: string,
    category: string
) {
    const expressions: string[] = [];
    allNodeTypes.forEach((expressionMapping) => {
        if (
            expressionMapping.metrics.includes(metricName) &&
            expressionMapping.category === category
        ) {
            const { expression } = expressionMapping;
            expressions.push(expression);
        }
    });
    return expressions;
}
