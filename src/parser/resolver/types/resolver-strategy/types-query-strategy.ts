import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture, type QueryMatch } from "tree-sitter";
import { type ClassType, type TypeInfo } from "../abstract-collector.js";
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
    ): Map<FQTN, TypeInfo> {
        const { filePath, language, tree } = parsedFile;

        let typesMap = this.fileToTypesMapCache.get(filePath);
        if (typesMap !== undefined) {
            return typesMap;
        }

        typesMap = new Map<FQTN, TypeInfo>();

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatement(new SimpleQueryStatement(typesQuery));

        const query = queryBuilder.build();
        let captures: QueryCapture[] = [];
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            captures = query.captures(tree.rootNode);
            matches = query.matches(tree.rootNode);
        }

        const textCaptures = getNameAndTextFromCaptures(captures);

        dlog("types definitions", filePath, textCaptures);
        for (const match of matches) {
            let namespace = "";
            let classType: ClassType = "class";
            let extendedClass: string | undefined;
            const implementedInterfaces: string[] = [];
            let className = "";
            for (const capture of match.captures) {
                let namespaceNotFoundYet = true;
                switch (capture.name) {
                    case "namespace_definition_name": {
                        if (namespaceNotFoundYet) {
                            namespace = capture.node.text;
                            namespaceNotFoundYet = false;
                        }

                        break;
                    }

                    case "class_type": {
                        classType = capture.node.text as ClassType;
                        break;
                    }

                    case "extended_class": {
                        extendedClass = capture.node.text;
                        break;
                    }

                    case "implemented_class": {
                        implementedInterfaces.push(capture.node.text);
                        break;
                    }

                    case "class_name": {
                        className = capture.node.text;
                        break;
                    }

                    default: {
                        break;
                    }
                }
            }

            const typeDeclaration: TypeInfo = {
                namespace,
                typeName: className,
                classType,
                sourceFile: parsedFile.filePath,
                namespaceDelimiter,
                implementedFrom: implementedInterfaces,
                extendedFrom: extendedClass,
            };

            typesMap.set(namespace + namespaceDelimiter + className, typeDeclaration);
        }

        this.fileToTypesMapCache.set(filePath, typesMap);

        return typesMap;
    }
}
