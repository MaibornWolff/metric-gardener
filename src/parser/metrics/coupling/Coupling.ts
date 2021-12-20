import { ExpressionMetricMapping } from "../../helper/Model";
import { NamespaceReference } from "../../collectors/namespaces/AbstractCollector";
import { UsageCandidate } from "../../collectors/usages/AbstractCollector";
import { NamespaceCollector } from "../../collectors/NamespaceCollector";
import { UsagesCollector } from "../../collectors/UsagesCollector";

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

    calculate(parseFiles: ParseFile[]) {
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

        const relationships = this.getRelationships(namespaces, usages);
        console.log("\n\n", relationships);

        const couplingMetrics = this.calculateCouplingMetrics(relationships);

        this.buildDependencyTree(relationships, couplingMetrics);

        return {
            relationships: relationships,
            metrics: couplingMetrics,
        };
    }

    private buildDependencyTree(
        couplingResults: CouplingMetricValue[],
        couplingValues: Map<string, { [key: string]: number }>
    ) {
        const tree = new Map<string, CouplingMetricValue[]>();
        for (const couplingItem of couplingResults) {
            const treeItem = tree.get(couplingItem.fromSource);
            if (treeItem === undefined) {
                tree.set(couplingItem.fromSource, [couplingItem]);
            } else {
                treeItem.push(couplingItem);
            }
        }

        const rootFiles: string[] = [];
        for (const [sourceFile, couplingMetrics] of couplingValues) {
            if (couplingMetrics["incoming_dependencies"] === 0) {
                rootFiles.push(sourceFile);
            }
        }

        // TODO cyclic dependency detection
        // for (const rootFile of rootFiles) {
        //     // scan tree for cycles and so on
        // }

        console.log(tree, rootFiles);
    }

    private calculateCouplingMetrics(couplingResults: CouplingMetricValue[]) {
        const couplingValues = new Map<string, { [key: string]: number }>();
        for (const couplingItem of couplingResults) {
            this.updateMetricsForFile(couplingItem.fromSource, "outgoing", couplingValues);
            this.updateMetricsForFile(couplingItem.toSource, "incoming", couplingValues);
        }

        console.log("\n\n", couplingValues);
        return couplingValues;
    }

    private updateMetricsForFile(
        filePath: string,
        direction: string,
        couplingValues: Map<string, { [key: string]: number }>
    ) {
        let couplingMetrics = couplingValues.get(filePath);
        if (couplingMetrics === undefined) {
            couplingMetrics = this.getNewCouplingMetrics();
            couplingValues.set(filePath, couplingMetrics);
        }

        couplingMetrics[
            direction === "outgoing" ? "outgoing_dependencies" : "incoming_dependencies"
        ] += 1;
        couplingMetrics["coupling_between_objects"] += 1;

        if (
            couplingMetrics["outgoing_dependencies"] === 0 &&
            couplingMetrics["incoming_dependencies"] === 0
        ) {
            couplingMetrics["instability"] = 1;
        } else {
            couplingMetrics["instability"] =
                couplingMetrics["outgoing_dependencies"] /
                (couplingMetrics["outgoing_dependencies"] +
                    couplingMetrics["incoming_dependencies"]);
        }
    }

    private getNewCouplingMetrics() {
        return {
            outgoing_dependencies: 0,
            incoming_dependencies: 0,
            coupling_between_objects: 0,
            instability: 0,
        };
    }

    private getRelationships(
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
                        toClassName: firstFromNamespace.className,
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
