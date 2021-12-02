import { ExpressionMetricMapping } from "../helper/Model";
import { NamespaceReference } from "../collectors/namespaces/AbstractCollector";
import { UsageCandidate } from "../collectors/usages/AbstractCollector";
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
        let namespaces: Map<string, NamespaceReference> = new Map();
        let usages: UsageCandidate[] = [];

        for (const parseFile of parseFiles) {
            namespaces = new Map([
                ...namespaces,
                ...this.namespaceCollector.getNamespaces(parseFile),
            ]);
        }

        for (const parseFile of parseFiles) {
            usages = usages.concat(
                this.usageCollector.getUsages(parseFile, this.namespaceCollector)
            );
        }

        console.log("\n\n");
        console.log("namespaces", namespaces, "\n\n");
        console.log("usages", usages);

        const couplingResults = this.getCoupledFilesData(namespaces, usages);

        console.log("\n\n", couplingResults);

        return {
            metricName: this.getName(),
            metricValue: couplingResults,
        };
    }

    private getCoupledFilesData(
        namespaces: Map<string, NamespaceReference>,
        usages: UsageCandidate[]
    ): CouplingMetricValue[] {
        return usages.flatMap((usage) => {
            // if (namespaces.has(usage.usedNamespace)) {
            // TODO: For what was this??
            // const fromData = [...namespaces.values()].filter((value) => {
            //     if (usage.source === value.source) {
            //         return value;
            //     }
            // });
            // if (fromData.length > 0) {
            const firstFromNamespace = namespaces.get(usage.usedNamespace);
            if (firstFromNamespace) {
                // TODO: Prevent duplicate adds
                // TODO: fromClassName and toClassName are broken
                return [
                    {
                        fromNamespace: usage.fromNamespace,
                        toNamespace: usage.usedNamespace,
                        fromSource: usage.sourceOfUsing,
                        toSource: firstFromNamespace.source,
                        fromClassName: firstFromNamespace.className,
                        toClassName: namespaces.get(usage.usedNamespace).className,
                        usageType: usage.usageType,
                    },
                ];
            }
            // }
            // }
            return [];
        });
    }

    getName(): string {
        return "coupling";
    }
}
