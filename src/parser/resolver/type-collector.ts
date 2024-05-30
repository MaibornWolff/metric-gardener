import { type ParsedFile } from "../metrics/metric.js";
import { type Language } from "../../helper/language.js";
import { type TypeInfo } from "./types/abstract-collector.js";
import { Factory as TypeCollectorFactory } from "./types/factory.js";

export class TypeCollector {
    private readonly typeCollectorFactory = new TypeCollectorFactory();
    private readonly languageToFilesMap = new Map<
        Language,
        Map<FilePath, Map<FullyQualifiedName, TypeInfo>>
    >();

    getTypesFromFile(parsedFile: ParsedFile): Map<FullyQualifiedName, TypeInfo> {
        const { filePath, language } = parsedFile;
        if (this.languageToFilesMap.get(language) === undefined) {
            this.languageToFilesMap.set(parsedFile.language, new Map());
        }

        const typesInFileFromCache = this.getTypesInFileFromCache(filePath, language);
        if (typesInFileFromCache) {
            return typesInFileFromCache;
        }

        const collector = this.typeCollectorFactory.getCollector(parsedFile);
        const typesMap =
            collector === undefined
                ? new Map<FullyQualifiedName, TypeInfo>()
                : collector.getTypesFromFile(parsedFile);

        this.languageToFilesMap.get(language)?.set(filePath, typesMap);

        return typesMap;
    }

    getTypesInFileFromCache(
        filePath: FilePath,
        language: Language,
    ): Map<FullyQualifiedName, TypeInfo> | undefined {
        const fileToTypesMap = this.languageToFilesMap.get(language);
        return fileToTypesMap?.get(filePath);
    }
}
