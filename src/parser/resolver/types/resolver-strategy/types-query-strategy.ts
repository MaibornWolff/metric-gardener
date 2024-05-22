import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture } from "tree-sitter";
import { type TypeInfo } from "../abstract-collector.js";
import { QueryBuilder } from "../../../queries/query-builder.js";
import { getNameAndTextFromCaptures } from "../../../../helper/helper.js";
import { type ParsedFile } from "../../../metrics/metric.js";
import { SimpleQueryStatement } from "../../../queries/query-statements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class TypesQueryStrategy {
    protected fileToTypesMapCache = new Map<FilePath, Map<FQTN, TypeInfo>>();

    getTypesFromFile(
        parsedFile: ParsedFile,
        namespaceDelimiter: string,
        typesQuery: string,
    ): Map<string, TypeInfo> {
        const { filePath, language, tree } = parsedFile;

        let typesMap = this.fileToTypesMapCache.get(filePath);
        if (typesMap !== undefined) {
            return typesMap;
        }

        typesMap = new Map<FQTN, TypeInfo>();

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([new SimpleQueryStatement(typesQuery)]);

        const query = queryBuilder.build();
        let captures: QueryCapture[] = [];
        if (query !== undefined) {
            captures = query.captures(tree.rootNode);
        }

        const textCaptures = getNameAndTextFromCaptures(captures);

        dlog("types definitions", filePath, textCaptures);

        for (let index = 0; index < textCaptures.length; index += 1) {
            const namespaceName = textCaptures[index].text;

            // Jump to first class name or class type capture
            index++;
            let isInterface =
                textCaptures[index]?.name === "class_type" &&
                textCaptures[index]?.text === "interface";
            if (isInterface) {
                // Jump to class name capture
                index++;
            }

            let hasClassDeclaration = textCaptures[index]?.name === "class_name";

            while (hasClassDeclaration) {
                const className = textCaptures[index].text;
                const typeDeclaration: TypeInfo = {
                    namespace: namespaceName,
                    typeName: className,
                    classType: isInterface ? "interface" : "class",
                    sourceFile: parsedFile.filePath,
                    namespaceDelimiter,
                    implementedFrom: [],
                };

                typesMap.set(namespaceName + namespaceDelimiter + className, typeDeclaration);

                // Jump to any next capture
                index++;
                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                if (textCaptures[index]?.name === "extended_class") {
                    typeDeclaration.extendedFrom = textCaptures[index].text;
                    index++;
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                let hasImplements = textCaptures[index]?.name === "implemented_class";

                while (hasImplements) {
                    const implementedClassName = textCaptures[index].text;
                    if (!typeDeclaration.implementedFrom.includes(implementedClassName)) {
                        typeDeclaration.implementedFrom.push(implementedClassName);
                    }

                    // Jump to next capture, no matter if implements class or any other
                    index++;
                    hasImplements = textCaptures[index]?.name === "implemented_class";
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                isInterface =
                    textCaptures[index]?.name === "class_type" &&
                    textCaptures[index]?.text === "interface";
                if (isInterface) {
                    // Jump to class name capture
                    index++;
                }

                hasClassDeclaration = textCaptures[index]?.name === "class_name";
            }

            if (textCaptures[index]?.name === "namespace_definition_name") {
                index--;
            }
        }

        this.fileToTypesMapCache.set(filePath, typesMap);

        return typesMap;
    }
}
