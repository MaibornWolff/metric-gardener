import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { TreeParser } from "../../helper/TreeParser";
import { NamespaceReference } from "../namespaces/AbstractCollector";

export interface UsageReference {
    usedNamespace: string;
    sourceOfUsing: string;
    alias?: string;
    source: string;
}

export abstract class AbstractCollector {
    protected abstract getUsagesQuery(): string;

    /*
     * Results caching not needed at the moment
     */
    getUsages(parseFile: ParseFile, packages: Map<string, NamespaceReference>): UsageReference[] {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getUsagesQuery()]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures = formatCaptures(tree, usagesCaptures);

        console.log(usagesTextCaptures);

        const usagesOfFile: UsageReference[] = [];

        for (let index = 0; index < usagesTextCaptures.length; index++) {
            if (usagesTextCaptures[index].name === "namespace_use_alias") {
                const namespaceAlias = usagesTextCaptures[index].text;
                usagesOfFile[index - 1].alias = namespaceAlias;

                continue;
            }

            const namespaceName = usagesTextCaptures[index].text;
            usagesOfFile.push({
                usedNamespace: namespaceName,
                sourceOfUsing: parseFile.filePath,
                alias: "",
                source: parseFile.filePath,
            });
        }

        return usagesOfFile;
    }
}
