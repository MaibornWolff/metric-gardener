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
        return { fileExtension: extension.toLowerCase(), filePath: filePath };
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
