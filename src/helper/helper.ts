import fs from "node:fs/promises";
import path from "node:path";
import { type QueryCapture } from "tree-sitter";
import { type Configuration } from "../parser/configuration.js";
import { NodeTypeQueryStatement } from "../parser/queries/query-statements.js";
import { type NodeTypeCategory, type NodeTypeConfig } from "./model.js";

/**
 * Looks up the passed string key converted to lower case in the passed map. Returns the retrieved value (if any).
 * @param map Map from which to retrieve the value.
 * @param key The key to look up after being converted to lower case. The passed object is not modified.
 * @return the value retrieved from the map, if any.
 */
export function lookupLowerCase<V>(map: Map<string, V>, key: string): V | undefined {
    const inLowerCase = key.toLowerCase();
    return map.get(inLowerCase);
}

/**
 * This was once used for debugging,
 * so that one can see which program code tree-sitter has found via the query
 * or which program code is behind a nodeType.
 */
export function getNameAndTextFromCaptures(
    captures: QueryCapture[],
): Array<{ name: string; text: string }> {
    return captures.map((capture) => {
        return {
            name: capture.name,
            text: capture.node.text,
        };
    });
}

/**
 * Formats the specified file path for being output in the way it is configured for this parser run.
 * @param filePath The file path.
 * @param config The configuration for this parser run.
 */
export function formatPrintPath(filePath: string, config: Configuration): string {
    let result = filePath;
    if (config.relativePaths) {
        // Return the file path relative to the specified base directory, or the name of the file,
        // if the base path points to this single file.
        result = path.relative(config.sourcesPath, filePath);
        if (result.length === 0) {
            // The path specified by the user points to a single file,
            // so return the name of the file as path to print.
            result = path.basename(filePath);
        }
    }

    return result;
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
    const stats = await fs.lstat(config.sourcesPath);
    if (stats.isFile()) {
        yield config.sourcesPath;
    } else {
        // SourcePath points to a directory, so use recursive function to find all files.

        // The folder at sourcePath itself cannot be excluded, so continue using delegating yield* generator call:
        yield* findFilesAsyncRecursive(config.sourcesPath, config.exclusions);
    }
}

async function* findFilesAsyncRecursive(
    directory: string,
    excludedFolders: Set<string>,
): AsyncGenerator<string> {
    const openedDirectory = await fs.opendir(directory);

    for await (const currentEntry of openedDirectory) {
        const currentPath = path.join(directory, currentEntry.name);

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

function findNodeTypesByCategories(
    allNodeTypes: NodeTypeConfig[],
    categories: Set<NodeTypeCategory>,
    callback: (nodeTypeConfig: NodeTypeConfig) => void,
): void {
    for (const nodeTypeConfig of allNodeTypes) {
        if (categories.has(nodeTypeConfig.category)) {
            callback(nodeTypeConfig);
        }
    }
}

export function getQueryStatementsByCategories(
    allNodeTypes: NodeTypeConfig[],
    ...categories: NodeTypeCategory[]
): NodeTypeQueryStatement[] {
    const statements: NodeTypeQueryStatement[] = [];
    findNodeTypesByCategories(allNodeTypes, new Set(categories), (nodeType) => {
        const queryStatement = new NodeTypeQueryStatement(nodeType);
        statements.push(queryStatement);
    });

    return statements;
}

export function getNodeTypesByCategories(
    allNodeTypes: NodeTypeConfig[],
    ...categories: NodeTypeCategory[]
): NodeTypeConfig[] {
    const types: NodeTypeConfig[] = [];
    findNodeTypesByCategories(allNodeTypes, new Set(categories), (nodeTypeConfig) =>
        types.push(nodeTypeConfig),
    );
    return types;
}

export function getNodeTypeNamesByCategories(
    allNodeTypes: NodeTypeConfig[],
    ...categories: NodeTypeCategory[]
): string[] {
    const typeNames: string[] = [];
    findNodeTypesByCategories(allNodeTypes, new Set(categories), (nodeTypeConfig) => {
        typeNames.push(nodeTypeConfig.type_name);
    });
    return typeNames;
}

/**
 * Create regex for multiple
 * @param keywords ,
 * which matches those keywords as independent words.
 * The keywords must contain only letters or spaces for this to work.
 * The regex is case-insensitive.
 */
export function createRegexFor(keywords: string[]): RegExp {
    return new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
}
