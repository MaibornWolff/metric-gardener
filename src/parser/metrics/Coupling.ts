import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";
import { NamespaceReference } from "../collectors/namespaces/AbstractCollector";
import { UsageReference } from "../collectors/usages/AbstractCollector";
import { NamespaceCollector } from "../collectors/NamespaceCollector";
import { UsagesCollector } from "../collectors/UsagesCollector";

export class Coupling implements CouplingMetric {
    private namespaceCollector: NamespaceCollector;
    private usageCollector: UsagesCollector;

    constructor(
        allNodeTypes: ExpressionMetricMapping[],
        namespaceCollector: NamespaceCollector,
        usageCollector: UsagesCollector
    ) {
        this.namespaceCollector = namespaceCollector;
        this.usageCollector = usageCollector;
    }

    calculate(parseFiles: ParseFile[]): CouplingMetricResult {
        let packages: Map<string, NamespaceReference> = new Map();
        let usages: UsageReference[] = [];

        for (const parseFile of parseFiles) {
            packages = new Map([...packages, ...this.namespaceCollector.getNamespaces(parseFile)]);
        }

        for (const parseFile of parseFiles) {
            usages = usages.concat(this.usageCollector.getUsages(parseFile, packages));
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
    ): CouplingMetricValue[] {
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
                                firstFromNamespace.className,
                            toNamespace: usage.usedNamespace,
                            fromSource: usage.source,
                            toSource: packages.get(usage.usedNamespace).source,
                            fromClassName: firstFromNamespace.className,
                            toClassName: packages.get(usage.usedNamespace).className,
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
