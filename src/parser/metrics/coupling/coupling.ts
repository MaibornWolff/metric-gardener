import { debuglog, type DebugLoggerFunction } from "node:util";
import { type TypeInfo } from "../../resolver/types/abstract-collector.js";
import {
    type UnresolvedCallExpression,
    type TypeUsageCandidate,
} from "../../resolver/call-expressions/abstract-collector.js";
import { type FqtnCollector } from "../../resolver/fqtn-collector.js";
import { type UsagesCollector } from "../../resolver/usages-collector.js";
import {
    type CouplingMetric,
    type Relationship,
    ParsedFile,
    type CouplingMetrics,
    type CouplingResult,
    type MetricName,
} from "../metric.js";
import { formatPrintPath } from "../../../helper/helper.js";
import { type PublicAccessorCollector } from "../../resolver/public-accessor-collector.js";
import { type Accessor } from "../../resolver/accessors/abstract-collector.js";
import { type Configuration } from "../../configuration.js";
import { parseSync } from "../../../helper/tree-parser.js";
import { getAdditionalRelationships } from "./call-expression-resolver.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Coupling implements CouplingMetric {
    private readonly filesWithMultipleNamespaces: ParsedFile[] = [];
    private readonly alreadyAddedRelationships = new Set<string>();

    private FQTNsMap = new Map<string, TypeInfo>();
    private readonly publicAccessorsMap = new Map<string, Accessor[]>();
    private readonly usagesCandidates: TypeUsageCandidate[] = [];
    private readonly unresolvedCallExpressions = new Map<string, UnresolvedCallExpression[]>();

    constructor(
        private readonly config: Configuration,
        private readonly FQTNCollector: FqtnCollector,
        private readonly usageCollector: UsagesCollector,
        private readonly publicAccessorCollector: PublicAccessorCollector,
    ) {}

    processFile(parsedFile: ParsedFile): void {
        // Preprocessing
        const FQTNsFromFile = this.FQTNCollector.getFQTNsFromFile(parsedFile);
        this.FQTNsMap = new Map([...this.FQTNsMap, ...FQTNsFromFile]);

        const accessorsFromFile = this.publicAccessorCollector.getPublicAccessorsFromFile(
            parsedFile,
            FQTNsFromFile,
        );
        for (const [accessorName, accessors] of accessorsFromFile) {
            const existingAccessors = this.publicAccessorsMap.get(accessorName);
            if (existingAccessors === undefined) {
                this.publicAccessorsMap.set(accessorName, accessors);
            } else {
                existingAccessors.push(...accessors);
            }
        }

        // Processing
        const { candidates, unresolvedCallExpressions: callExpressionsOfFile } =
            this.usageCollector.getUsageCandidates(parsedFile, this.FQTNCollector);
        this.usagesCandidates.push(...candidates);
        this.unresolvedCallExpressions.set(parsedFile.filePath, callExpressionsOfFile);
    }

    calculate(): CouplingResult {
        // Postprocessing

        dlog("\n\n");
        dlog("namespaces", this.FQTNsMap, "\n\n");
        dlog("usages", this.usagesCandidates);
        dlog("\n\n", "unresolved call expressions", this.unresolvedCallExpressions, "\n\n");
        dlog("\n\n", "publicAccessors", this.publicAccessorsMap, "\n\n");

        const relationships = this.getRelationships(this.FQTNsMap, this.usagesCandidates);
        dlog("\n\n", relationships);

        let couplingMetrics = this.calculateCouplingMetrics(relationships);
        const { tree } = this.buildDependencyTree(relationships, couplingMetrics);

        const additionalRelationships = getAdditionalRelationships(
            tree,
            this.unresolvedCallExpressions,
            this.publicAccessorsMap,
            this.alreadyAddedRelationships,
        );
        relationships.push(...additionalRelationships);
        dlog("\n\n", "additionalRelationships", additionalRelationships, "\n\n");

        couplingMetrics = this.calculateCouplingMetrics(relationships);

        return this.formatPrintedPaths(relationships, couplingMetrics);
    }

    getName(): MetricName {
        return "coupling";
    }

    private getRelationships(
        namespaces: Map<string, TypeInfo>,
        usagesCandidates: TypeUsageCandidate[],
    ): Relationship[] {
        return usagesCandidates.flatMap((usage) => {
            const usedNamespaceSource = namespaces.get(usage.usedNamespace);
            const fromNamespaceSource = namespaces.get(usage.fromNamespace);
            const uniqueId = usage.usedNamespace + usage.fromNamespace;

            if (
                usedNamespaceSource !== undefined &&
                fromNamespaceSource !== undefined &&
                !this.alreadyAddedRelationships.has(uniqueId) &&
                usage.fromNamespace !== usage.usedNamespace
            ) {
                this.alreadyAddedRelationships.add(uniqueId);

                // In C# we do not know if a base class is implemented or just extended
                // But if class type is interface, then it must be implemented instead of extended
                const fixedUsageType =
                    usage.usageType === "implements" &&
                    usedNamespaceSource.classType !== "interface"
                        ? "extends"
                        : usage.usageType;

                return [
                    {
                        fromNamespace: usage.fromNamespace,
                        toNamespace: usage.usedNamespace,
                        fromSource: usage.sourceOfUsing,
                        toSource: usedNamespaceSource.sourceFile,
                        fromClassName: fromNamespaceSource.typeName,
                        toClassName: usedNamespaceSource.typeName,
                        usageType: fixedUsageType,
                    },
                ];
            }

            return [];
        });
    }

    private buildDependencyTree(
        couplingResults: Relationship[],
        allCouplingMetrics: Map<string, CouplingMetrics>,
    ): {
        tree: Map<string, Relationship[]>;
        rootFiles: string[];
    } {
        const tree = new Map<string, Relationship[]>();
        for (const couplingItem of couplingResults) {
            const treeItem = tree.get(couplingItem.fromSource);
            if (treeItem === undefined) {
                tree.set(couplingItem.fromSource, [couplingItem]);
            } else {
                treeItem.push(couplingItem);
            }
        }

        const rootFiles: string[] = [];
        for (const [sourceFile, couplingMetrics] of allCouplingMetrics) {
            if (couplingMetrics.incoming_dependencies === 0) {
                rootFiles.push(sourceFile);
            }
        }

        return {
            tree,
            rootFiles,
        };

        // TODO cyclic dependency detection
        // for (const rootFile of rootFiles) {
        //     // scan tree for cycles and so on
        // }

        // console.log(tree, rootFiles);
    }

    private calculateCouplingMetrics(
        couplingResults: Relationship[],
    ): Map<string, CouplingMetrics> {
        const couplingValues = new Map<string, CouplingMetrics>();
        for (const couplingItem of couplingResults) {
            this.updateMetricsForFile(couplingItem.fromSource, "outgoing", couplingValues);
            this.updateMetricsForFile(couplingItem.toSource, "incoming", couplingValues);
        }

        dlog("\n\n", couplingValues);
        return couplingValues;
    }

    private updateMetricsForFile(
        filePath: string,
        direction: string,
        couplingValues: Map<string, CouplingMetrics>,
    ): void {
        let couplingMetrics = couplingValues.get(filePath);
        if (couplingMetrics === undefined) {
            couplingMetrics = this.getNewCouplingMetrics();
            couplingValues.set(filePath, couplingMetrics);
        }

        const parsedFile = parseSync(filePath, this.config);
        if (!(parsedFile instanceof ParsedFile)) {
            return;
        }

        const namespaces = this.FQTNCollector.getFQTNsFromFile(parsedFile);
        if (namespaces.size > 1) {
            this.filesWithMultipleNamespaces.push(parsedFile);
        }

        couplingMetrics[
            direction === "outgoing" ? "outgoing_dependencies" : "incoming_dependencies"
        ] += 1;
        couplingMetrics.coupling_between_objects += 1;

        if (
            couplingMetrics.outgoing_dependencies === 0 &&
            couplingMetrics.incoming_dependencies === 0
        ) {
            couplingMetrics.instability = 1;
        } else {
            couplingMetrics.instability =
                couplingMetrics.outgoing_dependencies /
                (couplingMetrics.outgoing_dependencies + couplingMetrics.incoming_dependencies);
        }
    }

    private getNewCouplingMetrics(): CouplingMetrics {
        return {
            outgoing_dependencies: 0,
            incoming_dependencies: 0,
            coupling_between_objects: 0,
            instability: 0,
        };
    }

    /**
     * If specified in the configuration, this replaces all file paths with the correctly formatted file paths
     * for the json output.
     * @param relationships Relationships to include in the output.
     * @param couplingMetrics Coupling metrics to include in the output.
     * @return A CouplingResult including the formatted relationships and coupling metrics.
     * @private
     */
    private formatPrintedPaths(
        relationships: Relationship[],
        couplingMetrics: Map<string, CouplingMetrics>,
    ): CouplingResult {
        if (this.config.relativePaths) {
            for (const relationship of relationships) {
                relationship.fromSource = formatPrintPath(relationship.fromSource, this.config);
                relationship.toSource = formatPrintPath(relationship.toSource, this.config);
            }

            const metrics = new Map<string, CouplingMetrics>();
            for (const [absolutePath, metricValues] of couplingMetrics) {
                metrics.set(formatPrintPath(absolutePath, this.config), metricValues);
            }

            couplingMetrics = metrics;
        }

        return { relationships, metrics: couplingMetrics };
    }
}
