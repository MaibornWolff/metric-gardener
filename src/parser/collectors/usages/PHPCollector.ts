import { TreeParser } from "../../helper/TreeParser";
import { AbstractCollector, UsageReference } from "./AbstractCollector";
import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { NamespaceCollector } from "../NamespaceCollector";

export class PHPCollector extends AbstractCollector {
    private groupedUsagesQuery = `
        (namespace_use_declaration
            (namespace_name) @namespace_name
            (namespace_use_group
                (namespace_use_group_clause
                    (namespace_name) @namespace_use_item_name
                )
            )
        )
    `;

    protected getUsagesQuery(): string {
        return `
            (namespace_use_clause
                (qualified_name) @namespace_use
                (namespace_aliasing_clause (name) @namespace_use_alias)?
            )+
        `;
    }

    getUsages(parseFile: ParseFile, namespaceCollector): UsageReference[] {
        const usages: UsageReference[] = super.getUsages(parseFile, namespaceCollector);
        return usages.concat(this.getGroupedUsages(parseFile, namespaceCollector));
    }

    private getGroupedUsages(parseFile: ParseFile, namespaceCollector: NamespaceCollector) {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.groupedUsagesQuery]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures = formatCaptures(tree, usagesCaptures);

        console.log(usagesTextCaptures);

        const usagesOfFile: UsageReference[] = [];

        for (let index = 0; index < usagesTextCaptures.length; index++) {
            const namespaceName = usagesTextCaptures[index].text;

            let hasUseGroupItem = usagesTextCaptures[index + 1]?.name === "namespace_use_item_name";
            let groupItemIndex = index;

            while (hasUseGroupItem) {
                const nextUseItem = usagesTextCaptures[groupItemIndex + 1];

                const usedNamespace = namespaceName + "\\" + nextUseItem.text;
                const usageNamespaceParts = usedNamespace.split("\\");
                const usedClass = usageNamespaceParts.pop();

                let usageType = "usage";

                for (const myNamespace of namespaceCollector.getNamespaces(parseFile).values()) {
                    if (myNamespace.implementedClasses.includes(usedClass)) {
                        usageType = "implements";
                        break;
                    }
                    if (myNamespace.extendedClass === usedClass) {
                        usageType = "extends";
                        break;
                    }
                }

                usagesOfFile.push({
                    usedNamespace: namespaceName + "\\" + nextUseItem.text,
                    sourceOfUsing: parseFile.filePath,
                    alias: "",
                    source: parseFile.filePath,
                    usageType: usageType,
                });

                hasUseGroupItem =
                    usagesTextCaptures[groupItemIndex + 2]?.name === "namespace_use_item_name";
                groupItemIndex++;
                index++;
            }
        }

        return usagesOfFile;
    }
}
