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
 * Returns the file path relative to the specified base directory, or the name of the file,
 * if the base path points to this single file.
 * @param filePath Path to the file to which the relative path should point.
 * @param baseDir The base directory.
 */
export function makePathRelative(filePath: string, baseDir: string) {
    let relPath = path.relative(baseDir, filePath);
    if (relPath.length == 0) {
        // The path specified by the user points to a single file,
        // so return the name of the file as path to print.
        relPath = path.basename(filePath);
    }
    return relPath;
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
