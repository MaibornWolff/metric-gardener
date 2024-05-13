import { type ParsedFile } from "../metrics/metric.js";
import { type Language } from "../../helper/language.js";
import { type TypeInfo } from "./types/abstract-collector.js";
import { Factory as NamespaceCollectorFactory } from "./types/factory.js";

export class FqtnCollector {
    private readonly namespaceCollectorFactory = new NamespaceCollectorFactory();
    private readonly languageToFilesMap = new Map<Language, Map<string, Map<string, TypeInfo>>>();

    getFQTNsFromFile(parsedFile: ParsedFile): Map<string, TypeInfo> {
        const { filePath, language } = parsedFile;
        if (this.languageToFilesMap.get(language) === undefined) {
            this.languageToFilesMap.set(parsedFile.language, new Map());
        }

        const fileToNamespacesMap = this.languageToFilesMap.get(language);
        const fileNamespaces = fileToNamespacesMap?.get(filePath);
        if (fileNamespaces !== undefined) {
            return fileNamespaces;
        }

        const collector = this.namespaceCollectorFactory.getCollector(parsedFile);
        const FQTNsMap =
            collector === undefined
                ? new Map<string, TypeInfo>()
                : collector.getTypesFromFile(parsedFile);

        this.languageToFilesMap.get(language)?.set(filePath, FQTNsMap);

        return FQTNsMap;
    }

    getAllNamespaces(): IterableIterator<[Language, Map<string, Map<string, TypeInfo>>]> {
        return this.languageToFilesMap.entries();
    }
}
