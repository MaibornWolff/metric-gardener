import fs from "fs";
import path from "path";
import { ExpressionMetricMapping } from "./Model";
import { Configuration } from "../Configuration";
import { ExpressionQueryStatement } from "../queries/QueryStatements";

/**
 * Maps all elements of the specified iterable using the specified map. Calls the specified function for all
 * mapped values, skipping elements for which there is no value available in the map.
 * @param iterator Iterable of elements to map.
 * @param map Map to use for mapping.
 * @param insertFunction Function to call with the retrieved values.
 */
export function mapAllFunctional<KeyType, ValueType>(
    iterator: Iterable<KeyType>,
    map: Map<KeyType, ValueType>,
    insertFunction: (v: ValueType) => void,
) {
    for (const key of iterator) {
        const mapResult = map.get(key);
        if (mapResult !== undefined) {
            insertFunction(mapResult);
        }
    }
}

/**
 * Looks up the passed string key converted to lower case in the passed map. Returns the retrieved value (if any).
 * @param map Map from which to retrieve the value.
 * @param key The key to look up after being converted to lower case. The passed object is not modified.
 * @return the value retrieved from the map, if any.
 */
export function lookupLowerCase<V>(map: Map<string, V>, key: string) {
    const inLowerCase = key.toLowerCase();
    return map.get(inLowerCase);
}

/**
 * Maps all elements of the specified iterable using the specified map. Returns an array of all mapped values,
 * skipping elements for which there is no value available in the map.
 * @param iterator Iterable of elements to map.
 * @param map Map to use for mapping.
 * @return Array of the mapped elements.
 */
export function mapAllIntoArray<KeyType, ValueType>(
    iterator: Iterable<KeyType>,
    map: Map<KeyType, ValueType>,
): ValueType[] {
    const result: ValueType[] = [];
    mapAllFunctional(iterator, map, (value) => result.push(value));
    return result;
}

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
    }
    return 0;
}

export function replaceForwardWithBackwardSlashes(path: string) {
    return path.replace(/\//g, "\\");
}

/**
 * Formats the specified file path for being output in the way it is configured for this parser run.
 * @param filePath The file path.
 * @param config The configuration for this parser run.
 * @param pathModule ONLY FOR TESTING PURPOSES: overrides the platform-specific path module.
 */
export function formatPrintPath(
    filePath: string,
    config: Configuration,
    pathModule = path,
): string {
    let result = filePath;
    if (config.relativePaths) {
        // Return the file path relative to the specified base directory, or the name of the file,
        // if the base path points to this single file.
        result = pathModule.relative(config.sourcesPath, filePath);
        if (result.length === 0) {
            // The path specified by the user points to a single file,
            // so return the name of the file as path to print.
            result = pathModule.basename(filePath);
        }
    }
    if (config.enforceBackwardSlash) {
        result = replaceForwardWithBackwardSlashes(result);
    }
    return result;
}

/**
 * Checks if there is a file extension in the specified path.
 * If so, this function returns the file extension.
 *
 * @param filePath Path that should be checked.
 * @return The file extension (or empty string).
 */
export function getFileExtension(filePath: string): string {
    const splitted = filePath.split(".");
    if (splitted.length >= 2) {
        return splitted[splitted.length - 1].toLowerCase();
    }
    return "";
}

/**
 * Finds files recursively in all subdirectories.
 *
 * This is an asynchronous generator function using asynchronous I/O,
 * which means it yields values when available.
 *
 * @param config Configuration of this parser run.
 * @return AsyncGenerator yielding found paths to single files.
 */
export async function* findFilesAsync(config: Configuration): AsyncGenerator<string> {
    // Handle special case: if the specified sourcePath is a single file, just yield the file.
    if ((await fs.promises.lstat(config.sourcesPath)).isFile()) {
        yield config.sourcesPath;
    } else {
        // sourcePath points to a directory, so use recursive function to find all files.

        // The folder at sourcePath itself cannot be excluded, so continue using delegating yield* generator call:
        yield* findFilesAsyncRecursive(config.sourcesPath, config.exclusions);
    }
}

async function* findFilesAsyncRecursive(
    dir: string,
    excludedFolders: Set<string>,
): AsyncGenerator<string> {
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
            yield currentPath;
        } // End of else (isDirectory)
    } // End of for await (directory entries)
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
                expressionMapping.languages,
                expressionMapping.activated_for_languages,
            );

            statements.push(queryStatement);
        }
    });
    return statements;
}

export function getExpressionsByCategory(
    allNodeTypes: ExpressionMetricMapping[],
    metricName: string,
    category: string,
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
