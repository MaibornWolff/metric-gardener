import { type Query, type QueryMatch } from "tree-sitter";
import { type ClassType, type TypeInfo } from "../abstract-collector.js";
import { type ParsedFile } from "../../../metrics/metric.js";

export class TypesQueryStrategy {
    protected fileToTypesMapCache = new Map<FilePath, Map<FullyQualifiedName, TypeInfo>>();

    getTypesFromFile(
        parsedFile: ParsedFile,
        namespaceDelimiter: string,
        typesQuery: Query,
    ): Map<FullyQualifiedName, TypeInfo> {
        const { filePath, tree } = parsedFile;

        let typesMap = this.fileToTypesMapCache.get(filePath);
        if (typesMap !== undefined) {
            return typesMap;
        }

        typesMap = new Map<FullyQualifiedName, TypeInfo>();

        let matches: QueryMatch[] = [];
        if (typesQuery !== undefined) {
            matches = typesQuery.matches(tree.rootNode);
        }

        for (const match of matches) {
            this.buildTypeInfos(match, filePath, namespaceDelimiter, typesMap);
        }

        this.fileToTypesMapCache.set(filePath, typesMap);

        return typesMap;
    }

    private buildTypeInfos(
        match: QueryMatch,
        filePath: string,
        namespaceDelimiter: string,
        typesMap: Map<FullyQualifiedName, TypeInfo>,
    ): void {
        let namespace = "";
        let classType: ClassType = "class";
        let extendedFrom: string | undefined;
        let implementedFrom: string[] = [];
        let typeName = "";
        let node;

        for (const capture of match.captures) {
            switch (capture.name) {
                case "namespace_definition_name": {
                    namespace = capture.node.text;
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

                case "type_node": {
                    if (node !== undefined) {
                        const typeInfo: TypeInfo = {
                            node,
                            namespace,
                            typeName,
                            classType,
                            sourceFile: filePath,
                            namespaceDelimiter,
                            implementedFrom,
                            extendedFrom,
                        };
                        typesMap.set(
                            typeInfo.namespace + namespaceDelimiter + typeInfo.typeName,
                            typeInfo,
                        );

                        classType = "class";
                        extendedFrom = undefined;
                        implementedFrom = [];
                        typeName = "";
                    }

                    node = capture.node;
                    break;
                }

                default: {
                    break;
                }
            }
        }

        const typeInfo: TypeInfo = {
            node,
            namespace,
            typeName,
            classType,
            sourceFile: filePath,
            namespaceDelimiter,
            implementedFrom,
            extendedFrom,
        };
        typesMap.set(typeInfo.namespace + namespaceDelimiter + typeInfo.typeName, typeInfo);
    }
}
