import { debuglog, type DebugLoggerFunction } from "node:util";
import { type Query, type QueryCapture, type QueryMatch } from "tree-sitter";
import { type TypeInfo } from "../types/abstract-collector.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});
export type Accessor = {
    name: string;
    FullyQualifiedAccessorName: FullyQualifiedName;
    fromType: TypeInfo;
    filePath: string;
    returnType: string;
};

export abstract class AbstractCollector {
    getAccessorsFromFile(
        filePath: string,
        typesFromFile: Map<FullyQualifiedName, TypeInfo>,
    ): Map<string, Accessor[]> {
        const accessorsMap = new Map<string, Accessor[]>();

        const accessorsQuery = this.getAccessorsQuery();

        for (const [fullyQualifiedTypeName, typeInfo] of typesFromFile) {
            let accessorMatches: QueryMatch[] = [];
            if (accessorsQuery !== undefined) {
                accessorMatches = accessorsQuery.matches(typeInfo.node!);
            }

            for (const match of accessorMatches) {
                const accessor = this.buildAccessorFromMatch(
                    match.captures,
                    fullyQualifiedTypeName,
                    typeInfo,
                    filePath,
                );

                if (accessorsMap.get(accessor.name) === undefined) {
                    accessorsMap.set(accessor.name, []);
                }

                accessorsMap.get(accessor.name)?.push(accessor);
            }
        }

        return accessorsMap;
    }

    protected abstract getAccessorsQuery(): Query;

    private buildAccessorFromMatch(
        captures: QueryCapture[],
        fullyQualifiedTypeName: string,
        typeInfo: TypeInfo,
        filePath: string,
    ): Accessor {
        let fullyQualifiedAccessorName = "";
        let returnType = "";

        for (const capture of captures) {
            if (capture.name === "accessor_return_type") {
                returnType = capture.node.text;
            } else if (capture.name === "accessor_name") {
                fullyQualifiedAccessorName =
                    fullyQualifiedTypeName + typeInfo.namespaceDelimiter + capture.node.text;
            }
        }

        return {
            FullyQualifiedAccessorName: fullyQualifiedTypeName,
            name: fullyQualifiedAccessorName,
            fromType: typeInfo,
            filePath,
            returnType,
        };
    }
}
