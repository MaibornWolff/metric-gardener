import { type QueryCapture } from "tree-sitter";
import { type Import } from "./abstract-collector.js";

export abstract class ImportMatch {
    constructor(public queryCaptures: QueryCapture[]) {}

    abstract toImport(namespaceDelimiter: string, filePath: FilePath): Import;
}

export class GroupedImportMatch extends ImportMatch {
    toImport(namespaceDelimiter: string, filePath: FilePath): Import {
        let importReference = "";
        let alias = "";
        let namespace = "";
        for (const capture of this.queryCaptures) {
            switch (capture.name) {
                case "grouped_import_alias": {
                    // Split alias from alias keyword (if any) by space and use last element by pop()
                    // capture.text result in e.g. "as Bubbler"
                    // it seems to be not possible to query the alias part only
                    alias = capture.node.text.split(" ").pop() ?? "";

                    break;
                }

                case "grouped_import_namespace": {
                    namespace = capture.node.text;

                    break;
                }

                case "grouped_import_name": {
                    importReference = capture.node.text;

                    break;
                }

                default: {
                    throw new Error(`Unknown capture name ${capture.name}`);
                }
            }
        }

        return {
            importReferenceFullName: namespace + namespaceDelimiter + importReference,
            importReference,
            alias,
            source: filePath,
        };
    }
}

export class SimpleImportMatch extends ImportMatch {
    toImport(namespaceDelimiter: string, filePath: FilePath): Import {
        let importReference = "";
        let alias = "";
        let importReferenceFullName = "";
        for (const capture of this.queryCaptures) {
            switch (capture.name) {
                case "alias": {
                    alias = capture.node.text;

                    break;
                }

                case "import_specifier": {
                    importReferenceFullName = capture.node.text;
                    importReference = importReferenceFullName.split(namespaceDelimiter).pop() ?? "";

                    break;
                }

                default: {
                    throw new Error(`Unknown capture name ${capture.name}`);
                }
            }
        }

        if (importReferenceFullName === "" || importReference === "") {
            throw new Error(
                "Fully Qualified Type Name: " +
                    importReferenceFullName +
                    " or type name: " +
                    importReference +
                    " is empty!",
            );
        }

        return {
            importReferenceFullName,
            importReference,
            alias,
            source: filePath,
        };
    }
}
