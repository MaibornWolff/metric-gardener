import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { ExpressionMetricMapping } from "../app";
import { formatCaptures } from "../helper/Helper";
import { TreeParser } from "../helper/TreeParser";

interface Package {
    namespace: string;
    class: string;
    source: string;
}

interface Usage {
    usedNamespace: string;
    alias?: string;
    source: string;
}

export class Coupling implements CouplingMetric {
    private namespaceStatementsSuperSet = [
        `
        (
            (namespace_definition
                name: (namespace_name) @namespace_definition_name
            )
            (class_declaration
                (name) @class_name
            )+
        )
    `,
    ];
    private namespaceUseStatementsSuperSets = [
        [
            `
            (namespace_use_declaration
                (namespace_name) @namespace_name
                (namespace_use_group
                    (namespace_use_group_clause
                        (namespace_name) @namespace_use_item_name
                    )
                )
            )
        `,
        ],
        [
            `
            (namespace_use_clause
                (qualified_name) @namespace_use
                (namespace_aliasing_clause (name) @namespace_use_alias)?
            )+
        `,
        ],
    ];

    private treeParser: TreeParser;

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression } = expressionMapping;
                this.namespaceStatementsSuperSet.push("(" + expression + ") @" + expression);
            }
        });
    }

    calculate(parseFiles: ParseFile[]): CouplingMetricResult {
        let packages: Map<string, Package> = new Map();
        let usages: Usage[] = [];

        for (const parseFile of parseFiles) {
            packages = new Map([...packages, ...this.getPackages(parseFile)]);

            usages = usages.concat(this.getGroupedUsages(parseFile));
            usages = usages.concat(this.getSimpleUsages(parseFile));
        }

        console.log("\n\n");
        console.log("packages", packages, "\n\n");
        console.log("usages", usages);

        const couplingResults = this.getCoupledFilesData(packages, usages);

        console.log("\n\n", couplingResults);

        return {
            metricName: this.getName(),
            metricValue: couplingResults,
        };
    }

    /**
     * TODO scan interface, abstract class, and trait declarations as well (not only classes)
     */
    private getPackages(parseFile: ParseFile) {
        const packages: Map<string, { namespace: string; class: string; source: string }> =
            new Map();

        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceStatementsSuperSet);

        const query = queryBuilder.build();
        const captures = query.captures(tree.rootNode);
        const textCaptures = formatCaptures(tree, captures);

        console.log(textCaptures);

        for (let index = 0; index < textCaptures.length; index += 1) {
            const namespaceName = textCaptures[index].text;

            let hasClassDeclaration = textCaptures[index + 1]?.name === "class_name";
            let classDeclarationIndex = index;

            while (hasClassDeclaration) {
                const className = textCaptures[classDeclarationIndex + 1].text;
                packages.set(namespaceName + "\\" + className, {
                    namespace: namespaceName,
                    class: className,
                    source: parseFile.filePath,
                });

                hasClassDeclaration =
                    textCaptures[classDeclarationIndex + 2]?.name === "class_name";
                classDeclarationIndex++;
                index++;
            }
        }

        return packages;
    }

    private getGroupedUsages(parseFile: ParseFile) {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceUseStatementsSuperSets[0]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures = formatCaptures(tree, usagesCaptures);

        console.log(usagesTextCaptures);

        const usagesOfFile: {
            usedNamespace: string;
            usedSource: string;
            alias?: string;
            source: string;
        }[] = [];

        for (let index = 0; index < usagesTextCaptures.length; index++) {
            const namespaceName = usagesTextCaptures[index].text;

            let hasUseGroupItem = usagesTextCaptures[index + 1]?.name === "namespace_use_item_name";
            let groupItemIndex = index;

            while (hasUseGroupItem) {
                const nextUseItem = usagesTextCaptures[groupItemIndex + 1];

                usagesOfFile.push({
                    usedNamespace: namespaceName + "\\" + nextUseItem.text,
                    usedSource: parseFile.filePath,
                    alias: "",
                    source: parseFile.filePath,
                });

                hasUseGroupItem =
                    usagesTextCaptures[groupItemIndex + 2]?.name === "namespace_use_item_name";
                groupItemIndex++;
                index++;
            }
        }

        return usagesOfFile;
    }

    private getSimpleUsages(parseFile: ParseFile) {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceUseStatementsSuperSets[1]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures = formatCaptures(tree, usagesCaptures);

        console.log(usagesTextCaptures);

        const usagesOfFile: {
            usedNamespace: string;
            usedSource: string;
            alias?: string;
            source: string;
        }[] = [];
        for (let index = 0; index < usagesTextCaptures.length; index++) {
            if (usagesTextCaptures[index].name === "namespace_use_alias") {
                const namespaceAlias = usagesTextCaptures[index].text;
                usagesOfFile[index - 1].alias = namespaceAlias;

                continue;
            }

            const namespaceName = usagesTextCaptures[index].text;
            usagesOfFile.push({
                usedNamespace: namespaceName,
                usedSource: parseFile.filePath,
                alias: "",
                source: parseFile.filePath,
            });
        }

        return usagesOfFile;
    }

    private getCoupledFilesData(packages: Map<string, Package>, usages: Usage[]) {
        return usages.flatMap((usage) => {
            if (packages.has(usage.usedNamespace)) {
                const fromData = [...packages.values()].filter((value) => {
                    if (usage.source === value.source) {
                        return value;
                    }
                });
                if (fromData.length > 0) {
                    const firstFromNamespace = fromData[0];
                    return [
                        {
                            fromNamespace:
                                firstFromNamespace.namespace + "\\" + firstFromNamespace.class,
                            toNamespace: usage.usedNamespace,
                            fromSource: usage.source,
                            toSource: packages.get(usage.usedNamespace).source,
                        },
                    ];
                }
            }
            return [];
        });
    }

    getName(): string {
        return "coupling";
    }
}
