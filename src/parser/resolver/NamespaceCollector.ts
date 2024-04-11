import { type ParsedFile } from "../metrics/Metric.js";
import { type Language } from "../helper/Language.js";
import { type FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector.js";
import { Factory as NamespaceCollectorFactory } from "./fullyQualifiedTypeNames/Factory.js";

export class NamespaceCollector {
    private readonly namespaceCollectorFactory = new NamespaceCollectorFactory();
    private readonly cache = new Map<Language, Map<string, Map<string, FullyQTN>>>();

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
            collector === undefined
                ? new Map<string, FullyQTN>()
                : collector.getFullyQTNs(parsedFile);

        this.cache.get(language)?.set(filePath, packages);

        return packages;
    }

    getAllNamespaces(): IterableIterator<[Language, Map<string, Map<string, FullyQTN>>]> {
        return this.cache.entries();
    }
}
