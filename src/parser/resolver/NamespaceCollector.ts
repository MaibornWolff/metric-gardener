import { FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector.js";
import { Factory as NamespaceCollectorFactory } from "./fullyQualifiedTypeNames/Factory.js";
import { ParsedFile } from "../metrics/Metric.js";
import { Language } from "../helper/Language.js";

export class NamespaceCollector {
    private namespaceCollectorFactory = new NamespaceCollectorFactory();
    private cache = new Map<Language, Map<string, Map<string, FullyQTN>>>();

    getNamespaces(parsedFile: ParsedFile): Map<string, FullyQTN> {
        const { filePath, language } = parsedFile;
        let namespacesByLanguage = this.cache.get(language);
        if (namespacesByLanguage === undefined) {
            this.cache.set(parsedFile.language, new Map());
        }

        namespacesByLanguage = this.cache.get(language);
        const fileNamespaces = namespacesByLanguage?.get(filePath);
        if (fileNamespaces !== undefined) {
            return fileNamespaces;
        }

        const collector = this.namespaceCollectorFactory.getCollector(parsedFile);
        const packages =
            collector !== undefined
                ? collector.getFullyQTNs(parsedFile)
                : new Map<string, FullyQTN>();

        this.cache.get(language)?.set(filePath, packages);

        return packages;
    }

    getAllNamespaces() {
        return this.cache.entries();
    }
}
