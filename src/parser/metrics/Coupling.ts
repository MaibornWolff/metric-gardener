import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";
import { NamespaceReference } from "../collectors/namespaces/AbstractCollector";
import { UsageReference } from "../collectors/usages/AbstractCollector";

export class Coupling implements CouplingMetric {
    private treeParser: TreeParser;

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;
    }

    calculate(parseFiles: ParseFile[]): CouplingMetricResult {
        let packages: Map<string, NamespaceReference> = new Map();
        let usages: UsageReference[] = [];

        for (const parseFile of parseFiles) {
            packages = new Map([...packages, ...this.treeParser.getNamespaces(parseFile)]);
        }

        for (const parseFile of parseFiles) {
            usages = usages.concat(this.treeParser.getUsages(parseFile, packages));
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

    private getCoupledFilesData(
        packages: Map<string, NamespaceReference>,
        usages: UsageReference[]
    ) {
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
                                firstFromNamespace.namespace +
                                firstFromNamespace.namespaceDelimiter +
                                firstFromNamespace.class,
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
