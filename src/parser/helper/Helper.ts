import fs from "fs";
import path from "path";
import { ExpressionMetricMapping, ExpressionQueryStatement } from "./Model";
import { ParseFile } from "../metrics/Metric";

export function formatCaptures(tree, captures) {
    return captures.map((c) => {
        const node = c.node;
        delete c.node;
        c.text = tree.getText(node);
        return c;
    });
}

export function getParseFile(filePath: string): undefined | ParseFile {
    const extension = filePath.split(".").pop();
    if (extension !== undefined && extension.length > 0) {
        return { language: extension.toLowerCase(), filePath: filePath };
    }
}

export function findFilesRecursively(
    dir: string,
    supportedFileExtensions: string[] = [],
    excludedFolders: string[] = [],
    fileList: ParseFile[] = []
): ParseFile[] {
    if (fs.lstatSync(dir).isFile()) {
        const parseFile = getParseFile(dir);
        return parseFile !== undefined ? [parseFile] : [];
    }

    fs.readdirSync(dir).forEach((file) => {
        const fileExtension = file.split(".").pop();

        const currentPath = path.join(dir, file);
        if (fs.statSync(currentPath).isDirectory()) {
            const isPathExcluded = excludedFolders.some((folder) => {
                return path.basename(currentPath) === folder;
            });
            if (isPathExcluded) {
                return;
            }
            fileList = findFilesRecursively(
                currentPath,
                supportedFileExtensions,
                excludedFolders,
                fileList
            );
        } else if (fileExtension && supportedFileExtensions.includes(fileExtension.toLowerCase())) {
            const parseFile = getParseFile(currentPath);
            if (parseFile != undefined) {
                fileList = fileList.concat(parseFile);
            }
        }
    });

    return fileList;
}

/**
 * Finds supported source code files recursively in all subdirectories.
 *
 * This is an asynchronous generator function using asynchronous I/O,
 * which means it yields values when available. However, after this function is finished,
 * the complete list of files is also available as return value of this function.
 *
 * @param sourcePath Path under which to search for source code files.
 * @param supportedFileExtensions File extensions that indicate that a file is supported.
 * @param excludedFolders Subdirectories which should not be searched.
 * @return List of all found files if needed for further processing.
 */
export async function* findFilesAsync(
    sourcePath: string,
    supportedFileExtensions: string[] = [],
    excludedFolders: string[] = []
): AsyncGenerator<ParseFile, ParseFile[]> {
    let fileList: ParseFile[] = [];
    try {
        const dir = await fs.promises.realpath(sourcePath);

        if ((await fs.promises.lstat(dir)).isFile()) {
            const parseFile = getParseFile(dir);
            if (parseFile !== undefined) {
                fileList = [parseFile];
                yield parseFile;
            }
        } else {
            const dirContent = await fs.promises.readdir(dir);
            for (const file of dirContent) {
                const fileExtension = file.split(".").pop();
                const currentPath = path.join(dir, file);

                if ((await fs.promises.stat(currentPath)).isDirectory()) {
                    const isPathExcluded = excludedFolders.some((folder) => {
                        return path.basename(currentPath) === folder;
                    });
                    if (isPathExcluded) {
                        // The current directory is excluded, so return
                        return fileList;
                    }
                    // Recurse into subdirectory, using delegating yield* generator call:
                    fileList = fileList.concat(
                        yield* findFilesAsync(currentPath, supportedFileExtensions, excludedFolders)
                    );
                } else if (
                    fileExtension &&
                    supportedFileExtensions.includes(fileExtension.toLowerCase())
                ) {
                    const parseFile = getParseFile(currentPath);
                    if (parseFile !== undefined) {
                        fileList = fileList.concat(parseFile);
                        yield parseFile;
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
    return fileList;
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
