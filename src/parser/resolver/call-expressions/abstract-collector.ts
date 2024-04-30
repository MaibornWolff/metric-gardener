import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture } from "tree-sitter";
import { type ParsedFile } from "../../metrics/metric.js";
import { formatCaptures } from "../../../helper/helper.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { type FullyQTN } from "../fully-qualified-type-names/abstract-collector.js";
import { SimpleQueryStatement } from "../../queries/query-statements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export type Accessor = {
    name: string;
    namespaces: FullyQTN[];
    filePath: string;
    returnType: string;
};

export abstract class AbstractCollector {
    getAccessors(
        parsedFile: ParsedFile,
        namespacesOfFile: Map<string, FullyQTN>,
    ): Map<string, Accessor[]> {
        const publicAccessors = new Map<string, Accessor[]>();

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
                    namespaces: [...namespacesOfFile.values()],
                    filePath,
                    returnType: accessorsTextCaptures[index].text,
                };

                index++;
                publicAccessor.name = accessorsTextCaptures[index].text;

                const accessorsByName = publicAccessors.get(publicAccessor.name);
                if (accessorsByName === undefined) {
                    publicAccessors.set(publicAccessor.name, []);
                }

                // TODO prevent duplicate adds by checking already existing combinations
                //  of name, returnType, and filepath
                publicAccessors.get(publicAccessor.name)?.push(publicAccessor);
            }
        }

        return publicAccessors;
    }

    protected abstract getAccessorsQuery(): string;
}
