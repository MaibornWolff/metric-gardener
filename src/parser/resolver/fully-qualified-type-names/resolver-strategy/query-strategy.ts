import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture } from "tree-sitter";
import { type FullyQTN } from "../abstract-collector.js";
import { QueryBuilder } from "../../../queries/query-builder.js";
import { formatCaptures } from "../../../helper/helper.js";
import { type ParsedFile } from "../../../metrics/metric.js";
import { SimpleQueryStatement } from "../../../queries/query-statements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class QueryStrategy {
    protected cache = new Map<string, Map<string, FullyQTN>>();

    getFullyQTNs(
        parsedFile: ParsedFile,
        namespaceDelimiter: string,
        namespacesQuery: string,
    ): Map<string, FullyQTN> {
        const { filePath, language, tree } = parsedFile;

        const cachedItem = this.cache.get(filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const namespaceDeclarations = new Map<string, FullyQTN>();

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([new SimpleQueryStatement(namespacesQuery)]);

        const query = queryBuilder.build();
        let captures: QueryCapture[] = [];
        if (query !== undefined) {
            captures = query.captures(tree.rootNode);
        }

        const textCaptures = formatCaptures(tree, captures);

        dlog("namespace definitions", filePath, textCaptures);

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
                const namespaceDeclaration: FullyQTN = {
                    namespace: namespaceName,
                    className,
                    classType: isInterface ? "interface" : "class",
                    source: parsedFile.filePath,
                    namespaceDelimiter,
                    implementedClasses: [],
                };

                namespaceDeclarations.set(
                    namespaceName + namespaceDelimiter + className,
                    namespaceDeclaration,
                );

                // Jump to any next capture
                index++;
                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                if (textCaptures[index]?.name === "extended_class") {
                    namespaceDeclaration.extendedClass = textCaptures[index].text;
                    index++;
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                let hasImplements = textCaptures[index]?.name === "implemented_class";

                while (hasImplements) {
                    const implementedClassName = textCaptures[index].text;
                    if (!namespaceDeclaration.implementedClasses.includes(implementedClassName)) {
                        namespaceDeclaration.implementedClasses.push(implementedClassName);
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

        this.cache.set(filePath, namespaceDeclarations);

        return namespaceDeclarations;
    }
}
