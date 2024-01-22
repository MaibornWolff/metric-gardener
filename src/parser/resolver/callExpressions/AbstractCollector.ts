import { ParseFile } from "../../metrics/Metric";
import { formatCaptures } from "../../helper/Helper";
import { QueryBuilder } from "../../queries/QueryBuilder";
import { TreeParser } from "../../helper/TreeParser";
import { FullyQTN } from "../fullyQualifiedTypeNames/AbstractCollector";
import { SimpleQueryStatement } from "../../helper/Model";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryCapture } from "tree-sitter";

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
        parseFile: ParseFile,
        namespacesOfFile: Map<string, FullyQTN>
    ): Map<string, Accessor[]> {
        const publicAccessors = new Map<string, Accessor[]>();

        if (this.getAccessorsQuery()) {
            const tree = TreeParser.getParseTree(parseFile);

            const queryBuilder = new QueryBuilder(parseFile.fileExtension, tree);
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
                    filePath: parseFile.filePath,
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
