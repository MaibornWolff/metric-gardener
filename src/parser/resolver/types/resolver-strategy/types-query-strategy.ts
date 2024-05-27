import { type Query, type QueryMatch } from "tree-sitter";
import { type ClassType, type TypeInfo } from "../abstract-collector.js";
import { type ParsedFile } from "../../../metrics/metric.js";

export class TypesQueryStrategy {
    protected fileToTypesMapCache = new Map<FilePath, Map<FQTN, TypeInfo>>();

    getTypesFromFile(
        parsedFile: ParsedFile,
        namespaceDelimiter: string,
        typesQuery: Query,
    ): Map<FQTN, TypeInfo> {
        const { filePath, tree } = parsedFile;

        let typesMap = this.fileToTypesMapCache.get(filePath);
        if (typesMap !== undefined) {
            return typesMap;
        }

        typesMap = new Map<FQTN, TypeInfo>();

        let matches: QueryMatch[] = [];
        if (typesQuery !== undefined) {
            matches = typesQuery.matches(tree.rootNode);
        }

        matches.map((match) => {
            const typeInfo = this.buildTypeInfo(match, filePath, namespaceDelimiter);
            typesMap!.set(typeInfo.namespace + namespaceDelimiter + typeInfo.typeName, typeInfo);
            return typeInfo;
        });

        this.fileToTypesMapCache.set(filePath, typesMap);

        return typesMap;
    }

    private buildTypeInfo(
        match: QueryMatch,
        filePath: string,
        namespaceDelimiter: string,
    ): TypeInfo {
        let namespace = "";
        let classType: ClassType = "class";
        let extendedFrom: string | undefined;
        const implementedFrom: string[] = [];
        let typeName = "";
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
                    extendedFrom = capture.node.text;
                    break;
                }

                case "implemented_class": {
                    implementedFrom.push(capture.node.text);
                    break;
                }

                case "class_name": {
                    typeName = capture.node.text;
                    break;
                }

                default: {
                    break;
                }
            }
        }

        return {
            namespace,
            typeName,
            classType,
            sourceFile: filePath,
            namespaceDelimiter,
            implementedFrom,
            extendedFrom,
        };
    }
}
