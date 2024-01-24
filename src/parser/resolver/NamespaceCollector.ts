import { FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector";
import { Factory as NamespaceCollectorFactory } from "./fullyQualifiedTypeNames/Factory";
import { ParseFile } from "../metrics/Metric";

export class NamespaceCollector {
    private namespaceCollectorFactory = new NamespaceCollectorFactory();
    private cache = new Map<string, Map<string, Map<string, FullyQTN>>>();

    getNamespaces(parseFile: ParseFile): Map<string, FullyQTN> {
        let namespacesByLanguage = this.cache.get(parseFile.fileExtension);
        if (namespacesByLanguage === undefined) {
            this.cache.set(parseFile.fileExtension, new Map());
        }

        namespacesByLanguage = this.cache.get(parseFile.fileExtension);
        const fileNamespaces = namespacesByLanguage?.get(parseFile.filePath);
        if (fileNamespaces !== undefined) {
            return fileNamespaces;
        }

        const collector = this.namespaceCollectorFactory.getCollector(parseFile);
        const packages =
            collector !== undefined
                ? collector.getFullyQTNs(parseFile)
                : new Map<string, FullyQTN>();

        this.cache.get(parseFile.fileExtension)?.set(parseFile.filePath, packages);

        return packages;
    }

    getAllNamespaces() {
        return this.cache.entries();
    }
}
