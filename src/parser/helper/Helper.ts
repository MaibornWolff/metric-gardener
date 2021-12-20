import fs from "fs";
import path from "path";
import { ExpressionMetricMapping } from "./Model";
import { ParseFile } from "../metrics/Metric";

export function formatCaptures(tree, captures) {
    return captures.map((c) => {
        const node = c.node;
        delete c.node;
        c.text = tree.getText(node);
        return c;
    });
}

function getParseFile(filePath: string): undefined | ParseFile {
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

        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            const isPathExcluded = excludedFolders.some((folder) => {
                return dir.includes(folder);
            });
            if (isPathExcluded) {
                return;
            }

            fileList = findFilesRecursively(
                path.join(dir, file),
                supportedFileExtensions,
                excludedFolders,
                fileList
            );
        } else if (fileExtension && supportedFileExtensions.includes(fileExtension.toLowerCase())) {
            const parseFile = getParseFile(path.join(dir, file));
            if (parseFile != undefined) {
                fileList = fileList.concat(parseFile);
            }
        }
    });

    return fileList;
}

export function getQueryStatements(allNodeTypes: ExpressionMetricMapping[], metricName: string) {
    const statements: string[] = [];
    allNodeTypes.forEach((expressionMapping) => {
        if (
            expressionMapping.metrics.includes(metricName) &&
            expressionMapping.type === "statement"
        ) {
            const { expression } = expressionMapping;
            statements.push("(" + expression + ") @" + expression);
        }
    });
    return statements;
}
