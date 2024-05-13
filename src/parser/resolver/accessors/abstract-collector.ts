import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture } from "tree-sitter";
import { type ParsedFile } from "../../metrics/metric.js";
import { formatCaptures } from "../../../helper/helper.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { type TypeInfo } from "../types/abstract-collector.js";
import { SimpleQueryStatement } from "../../queries/query-statements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export type Accessor = {
    name: string;
    FQTNInfos: TypeInfo[];
    filePath: string;
    returnType: string;
};

export abstract class AbstractCollector {
    getPublicAccessorsFromFile(
        parsedFile: ParsedFile,
        FQTNsFromFile: Map<string, TypeInfo>,
    ): Map<string, Accessor[]> {
        const publicAccessorsMap = new Map<string, Accessor[]>();

        if (this.getAccessorsQuery()) {
            const { filePath, language, tree } = parsedFile;

            const queryBuilder = new QueryBuilder(language);
            queryBuilder.setStatements([new SimpleQueryStatement(this.getAccessorsQuery())]);

            const publicAccessorsQuery = queryBuilder.build();
            let publicAccessorsCaptures: QueryCapture[] = [];
            if (publicAccessorsQuery !== undefined) {
                publicAccessorsCaptures = publicAccessorsQuery.captures(tree.rootNode);
            }

            const accessorsTextCaptures: Array<{
                name: string;
                text: string;
                usageType?: string;
                source?: string;
            }> = formatCaptures(tree, publicAccessorsCaptures);

            dlog("public accessors captures", accessorsTextCaptures);

            // First index must be the return type
            // Second index must be the accessor name
            for (let index = 0; index < accessorsTextCaptures.length; index += 1) {
                const publicAccessor: Accessor = {
                    name: "",
                    FQTNInfos: [...FQTNsFromFile.values()],
                    filePath,
                    returnType: accessorsTextCaptures[index].text,
                };

                index++;
                publicAccessor.name = accessorsTextCaptures[index].text;

                if (publicAccessorsMap.get(publicAccessor.name) === undefined) {
                    publicAccessorsMap.set(publicAccessor.name, []);
                }

                // TODO prevent duplicate adds by checking already existing combinations
                //  of name, returnType, and filepath
                publicAccessorsMap.get(publicAccessor.name)?.push(publicAccessor);
            }
        }

        return publicAccessorsMap;
    }

    protected abstract getAccessorsQuery(): string;
}
