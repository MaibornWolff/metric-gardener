import { type ImportReference } from "./abstract-collector.js";

export type ImportCapture = {
    name: string;
    text: string;
};

export abstract class ImportMatch {
    constructor(public importCaptures: ImportCapture[]) {}

    abstract toImportReference(namespaceDelimiter: string, filePath: FilePath): ImportReference;
}

export class GroupedImportMatch extends ImportMatch {
    toImportReference(namespaceDelimiter: string, filePath: FilePath): ImportReference {
        let typeName = "";
        let alias = "";
        let namespaceName = "";
        for (const capture of this.importCaptures) {
            switch (capture.name) {
                case "grouped_import_alias": {
                    // Split alias from alias keyword (if any) by space and use last element by pop()
                    // capture.text result in e.g. "as Bubbler"
                    // it seems to be not possible to query the alias part only
                    alias = capture.text.split(" ").pop() ?? "";

                    break;
                }

                case "grouped_import_namespace": {
                    namespaceName = capture.text;

                    break;
                }

                case "grouped_import_name": {
                    typeName = capture.text;

                    break;
                }

                default: {
                    throw new Error(`Unknown capture name ${capture.name}`);
                }
            }
        }

        return {
            FQTN: namespaceName + namespaceDelimiter + typeName,
            typeName,
            alias,
            source: filePath,
            usageType: "usage",
        };
    }
}

export class SimpleImportMatch extends ImportMatch {
    toImportReference(namespaceDelimiter: string, filePath: FilePath): ImportReference {
        let typeName = "";
        let alias = "";
        let FQTN = "";
        for (const capture of this.importCaptures) {
            switch (capture.name) {
                case "alias": {
                    alias = capture.text;

                    break;
                }

                case "import_specifier": {
                    FQTN = capture.text;
                    typeName = FQTN.split(namespaceDelimiter).pop() ?? "";

                    break;
                }

                default: {
                    throw new Error(`Unknown capture name ${capture.name}`);
                }
            }
        }

        if (FQTN === "" || typeName === "") {
            throw new Error(
                "Fully Qualified Type Name: " + FQTN + " or type name: " + typeName + " is empty!",
            );
        }

        return {
            FQTN,
            typeName,
            alias,
            source: filePath,
            usageType: "usage",
        };
    }
}
