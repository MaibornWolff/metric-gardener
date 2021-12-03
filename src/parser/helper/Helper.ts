import fs from "fs";
import path from "path";

export function formatCaptures(tree, captures) {
    return captures.map((c) => {
        const node = c.node;
        delete c.node;
        c.text = tree.getText(node);
        return c;
    });
}

function getParseFile(filePath: string): undefined | ParseFile {
    if (filePath.includes(".")) {
        const extension = filePath.split(".").pop();
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
        } else if (supportedFileExtensions.includes(file.split(".").pop().toLowerCase())) {
            const parseFile = getParseFile(path.join(dir, file));
            if (parseFile != undefined) {
                fileList = fileList.concat(parseFile);
            }
        }
    });
    return fileList;
}
