import { NamespaceCollector } from "../NamespaceCollector";
import { ParseFile } from "../../metrics/Metric";
import { formatCaptures } from "../../helper/Helper";
import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { TreeParser } from "../../helper/TreeParser";
import { NamespaceDefinition } from "../namespaces/AbstractCollector";

export interface PublicAccessor {
    name: string;
    namespaces: NamespaceDefinition[];
    filePath: string;
    returnType: string;
}

export abstract class AbstractCollector {
    protected abstract getPublicAccessorsQuery(): string;

    getPublicAccessors(
        parseFile: ParseFile,
        namespacesOfFile: Map<string, NamespaceDefinition>
    ): Map<string, PublicAccessor[]> {
        const publicAccessors = new Map<string, PublicAccessor[]>();

        if (this.getPublicAccessorsQuery()) {
            const tree = TreeParser.getParseTree(parseFile);
            const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
            queryBuilder.setStatements([this.getPublicAccessorsQuery()]);

            const publicAccessorsQuery = queryBuilder.build();
            const publicAccessorsCaptures = publicAccessorsQuery.captures(tree.rootNode);
            const accessorsTextCaptures: {
                name: string;
                text: string;
                usageType?: string;
                source?: string;
            }[] = formatCaptures(tree, publicAccessorsCaptures);

            console.log("public accessors captures", accessorsTextCaptures);

            // first index must be the return type
            // second index must be the accessor name
            // third index (not_empty_accessor flag) must be ignored, if present
            for (let index = 0; index < accessorsTextCaptures.length; index += 1) {
                const publicAccessor: PublicAccessor = {
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

                publicAccessors.get(publicAccessor.name)?.push(publicAccessor);

                if (accessorsTextCaptures[index + 1]?.name === "not_empty_accessor") {
                    index++;
                }
            }
        }

        return publicAccessors;
    }
}
