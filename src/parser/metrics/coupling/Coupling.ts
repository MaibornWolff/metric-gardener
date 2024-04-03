import { FullyQTN } from "../../resolver/fullyQualifiedTypeNames/AbstractCollector.js";
import {
    UnresolvedCallExpression,
    TypeUsageCandidate,
} from "../../resolver/typeUsages/AbstractCollector.js";
import { NamespaceCollector } from "../../resolver/NamespaceCollector.js";
import { UsagesCollector } from "../../resolver/UsagesCollector.js";
import {
    CouplingMetric,
    Relationship,
    ParsedFile,
    CouplingMetrics,
    CouplingResult,
} from "../Metric.js";
import { formatPrintPath } from "../../helper/Helper.js";
import { PublicAccessorCollector } from "../../resolver/PublicAccessorCollector.js";
import { Accessor } from "../../resolver/callExpressions/AbstractCollector.js";
import { getAdditionalRelationships } from "./CallExpressionResolver.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Configuration } from "../../Configuration.js";
import { TreeParser } from "../../helper/TreeParser.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Coupling implements CouplingMetric {
    private config: Configuration;
    private namespaceCollector: NamespaceCollector;
    private publicAccessorCollector: PublicAccessorCollector;
    private usageCollector: UsagesCollector;
    private filesWithMultipleNamespaces: ParsedFile[] = [];
    private alreadyAddedRelationships = new Set<string>();

    private namespaces: Map<string, FullyQTN> = new Map();
    private publicAccessors = new Map<string, Accessor[]>();
    private usagesCandidates: TypeUsageCandidate[] = [];
    private unresolvedCallExpressions = new Map<string, UnresolvedCallExpression[]>();

    constructor(
        config: Configuration,
        namespaceCollector: NamespaceCollector,
        usageCollector: UsagesCollector,
        publicAccessorCollector: PublicAccessorCollector,
    ) {
        this.config = config;
        this.namespaceCollector = namespaceCollector;
        this.usageCollector = usageCollector;
        this.publicAccessorCollector = publicAccessorCollector;
    }

    processFile(parsedFile: ParsedFile) {
        // preprocessing
        const moreNamespaces = this.namespaceCollector.getNamespaces(parsedFile);
        this.namespaces = new Map([...this.namespaces, ...moreNamespaces]);

        const moreAccessors = this.publicAccessorCollector.getPublicAccessors(
            parsedFile,
            moreNamespaces,
        );
        for (const [accessorName, accessors] of moreAccessors) {
            const existingAccessors = this.publicAccessors.get(accessorName);
            if (existingAccessors !== undefined) {
                existingAccessors.push(...accessors);
            } else {
                this.publicAccessors.set(accessorName, accessors);
            }
        }

        // processing
        const { candidates, unresolvedCallExpressions: callExpressionsOfFile } =
            this.usageCollector.getUsageCandidates(parsedFile, this.namespaceCollector);
        this.usagesCandidates = this.usagesCandidates.concat(candidates);
        this.unresolvedCallExpressions.set(parsedFile.filePath, callExpressionsOfFile);
    }

    calculate() {
        // postprocessing

        dlog("\n\n");
        dlog("namespaces", this.namespaces, "\n\n");
        dlog("usages", this.usagesCandidates);
        dlog("\n\n", "unresolved call expressions", this.unresolvedCallExpressions, "\n\n");
        dlog("\n\n", "publicAccessors", this.publicAccessors, "\n\n");

        let relationships = this.getRelationships(this.namespaces, this.usagesCandidates);
        dlog("\n\n", relationships);

        let couplingMetrics = this.calculateCouplingMetrics(relationships);
        const tree = this.buildDependencyTree(relationships, couplingMetrics).tree;

        const additionalRelationships = getAdditionalRelationships(
            tree,
            this.unresolvedCallExpressions,
            this.publicAccessors,
            this.alreadyAddedRelationships,
        );
        relationships = relationships.concat(additionalRelationships);
        dlog("\n\n", "additionalRelationships", additionalRelationships, "\n\n");

        couplingMetrics = this.calculateCouplingMetrics(relationships);

        return this.formatPrintedPaths(relationships, couplingMetrics);
    }

    private getRelationships(
        namespaces: Map<string, FullyQTN>,
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
                        toSource: usedNamespaceSource.source,
                        fromClassName: fromNamespaceSource.className,
                        toClassName: usedNamespaceSource.className,
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
    ) {
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

        //console.log(tree, rootFiles);
    }

    private calculateCouplingMetrics(couplingResults: Relationship[]) {
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
    ) {
        let couplingMetrics = couplingValues.get(filePath);
        if (couplingMetrics === undefined) {
            couplingMetrics = this.getNewCouplingMetrics();
            couplingValues.set(filePath, couplingMetrics);
        }

        const parsedFile = TreeParser.parseSync(filePath, this.config);
        if (!(parsedFile instanceof ParsedFile)) {
            return;
        }

        const namespaces = this.namespaceCollector.getNamespaces(parsedFile);
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
            const relCouplingMetrics = new Map();
            for (const [absolutePath, metricValues] of couplingMetrics) {
                relCouplingMetrics.set(formatPrintPath(absolutePath, this.config), metricValues);
            }
            couplingMetrics = relCouplingMetrics;
        }
        return { relationships: relationships, metrics: couplingMetrics };
    }

    getName(): string {
        return "coupling";
    }
}
