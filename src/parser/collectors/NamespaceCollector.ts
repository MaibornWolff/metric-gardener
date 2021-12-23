import { NamespaceReference } from "./namespaces/AbstractCollector";
import { Factory as NamespaceCollectorFactory } from "./namespaces/Factory";
import { ParseFile } from "../metrics/Metric";

export class NamespaceCollector {
    private namespaceCollectorFactory = new NamespaceCollectorFactory();
    private cache = new Map<string, Map<string, Map<string, NamespaceReference>>>();

    getNamespaces(parseFile: ParseFile): Map<string, NamespaceReference> {
        let namespacesByLanguage = this.cache.get(parseFile.language);
        if (namespacesByLanguage === undefined) {
            this.cache.set(parseFile.language, new Map());
        }

        namespacesByLanguage = this.cache.get(parseFile.language);
        const fileNamespaces = namespacesByLanguage?.get(parseFile.filePath);
        if (fileNamespaces !== undefined) {
            return fileNamespaces;
        }

        const collector = this.namespaceCollectorFactory.getCollector(parseFile);
        const packages =
            collector !== undefined
                ? collector.getNamespaces(parseFile)
                : new Map<string, NamespaceReference>();

        this.cache.get(parseFile.language)?.set(parseFile.filePath, packages);

        return packages;
    }

    getAllNamespaces() {
        return this.cache.entries();
    }
}
