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
 * Checks whether the specified path represents a file with a file extension.
 * If so, this function returns a corresponding {@link ParseFile}-object that includes the file extension.
 * @param filePath Path that should be checked.
 * @param config Configuration of this parser run.
 * @return A ParseFile-object if there is a file extension, undefined if there is no file extension present.
 */
export function checkAndGetFileExtension(filePath: string, config: Configuration): undefined | ParseFile {
    const splitted = filePath.split(".");
    if (splitted.length >= 2) {
        const fileExtension = splitted[splitted.length - 1].toLowerCase();
        if (fileExtension.length > 0) {
            let printPath = filePath;

            if(config.relativePaths){
                printPath = path.relative(config.sourcesPath, filePath);
                console.log("Relative path: |" + printPath + "|");
                if(printPath.length == 0){
                    printPath = path.basename(filePath);
                }
            }
            return { fileExtension: fileExtension, filePath: filePath, printedFilePath: printPath };
        }
    }
}

/**
 * Finds supported source code files recursively in all subdirectories.
 *
 * This is an asynchronous generator function using asynchronous I/O,
 * which means it yields values when available. However, after this generator is done,
 * the complete list of files is also available as return value of this function.
 *
 * @param config Configuration of this parser run.
 */
export async function* findFilesAsync(
    config: Configuration,
): AsyncGenerator<ParseFile> {
    try {
        // Handle special case: if the specified sourcePath is a single file, just yield the file.
        if ((await fs.promises.lstat(config.sourcesPath)).isFile()) {
            const parseFile = checkAndGetFileExtension(config.sourcesPath, config);
            if (parseFile !== undefined && fileExtensionToGrammar.has(parseFile.fileExtension)) {
                yield parseFile;
            }
        } else {
            // sourcePath points to a directory, so use recursive function to find all files.

            // Create set to improve lookup performance:
            const excludedSet = new Set(config.exclusions);
            // The folder at sourcePath itself cannot be excluded, so continue using delegating yield* generator call:
            yield* findFilesAsyncRecursive(config.sourcesPath, excludedSet, config);
        }
    } catch (e) {
        console.error(e);
    }
}

async function* findFilesAsyncRecursive(
    dir: string,
    excludedFolders: Set<string>,
    config: Configuration
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
                    yield* findFilesAsyncRecursive(currentPath, excludedFolders, config);
                }
            } // End of if (isDirectory)
            else {
                const parseFile = checkAndGetFileExtension(currentPath, config);
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
