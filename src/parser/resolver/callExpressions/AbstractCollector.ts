import { ParsedFile } from "../../metrics/Metric.js";
import { formatCaptures } from "../../helper/Helper.js";
import { QueryBuilder } from "../../queries/QueryBuilder.js";
import { FullyQTN } from "../fullyQualifiedTypeNames/AbstractCollector.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryCapture } from "tree-sitter";
import { SimpleQueryStatement } from "../../queries/QueryStatements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export interface Accessor {
    name: string;
    namespaces: FullyQTN[];
    filePath: string;
    returnType: string;
}

export abstract class AbstractCollector {
    protected abstract getAccessorsQuery(): string;

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

            const accessorsTextCaptures: {
                name: string;
                text: string;
                usageType?: string;
                source?: string;
            }[] = formatCaptures(tree, publicAccessorsCaptures);

            dlog("public accessors captures", accessorsTextCaptures);

            // first index must be the return type
            // second index must be the accessor name
            for (let index = 0; index < accessorsTextCaptures.length; index += 1) {
                const publicAccessor: Accessor = {
                    name: "",
                    namespaces: Array.from(namespacesOfFile.values()),
                    filePath: filePath,
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
}
