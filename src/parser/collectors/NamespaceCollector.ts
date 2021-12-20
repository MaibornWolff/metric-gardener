import { NamespaceReference } from "./namespaces/AbstractCollector";
import { Factory as NamespaceCollectorFactory } from "./namespaces/Factory";
import { ParseFile } from "../metrics/Metric";

export class NamespaceCollector {
    private namespaceCollectorFactory = new NamespaceCollectorFactory();
    private cache = new Map<string, Map<string, Map<string, NamespaceReference>>>();

    getNamespaces(parseFile: ParseFile): Map<string, NamespaceReference> {
        const collector = this.namespaceCollectorFactory.getCollector(parseFile);
        const packages =
            collector !== undefined
                ? collector.getNamespaces(parseFile)
                : new Map<string, NamespaceReference>();

        if (packages.size === 0) {
            return packages;
        }

        if (!this.cache.has(parseFile.language)) {
            this.cache.set(parseFile.language, new Map());
        }

        const namespacesByLanguage = this.cache.get(parseFile.language);
        if (namespacesByLanguage !== undefined && !namespacesByLanguage.has(parseFile.filePath)) {
            namespacesByLanguage.set(parseFile.filePath, packages);
        }

        return packages;
    }

    getAllNamespaces() {
        return this.cache.entries();
    }
}
