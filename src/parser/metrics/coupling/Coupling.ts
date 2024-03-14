import { NodeTypeConfig } from "../../helper/Model";
import { FullyQTN } from "../../resolver/fullyQualifiedTypeNames/AbstractCollector";
import {
    UnresolvedCallExpression,
    TypeUsageCandidate,
} from "../../resolver/typeUsages/AbstractCollector";
import { NamespaceCollector } from "../../resolver/NamespaceCollector";
import { UsagesCollector } from "../../resolver/UsagesCollector";
import {
    CouplingMetric,
    Relationship,
    ParsedFile,
    CouplingMetrics,
    CouplingResult,
    isParsedFile,
} from "../Metric";
import { formatPrintPath } from "../../helper/Helper";
import { PublicAccessorCollector } from "../../resolver/PublicAccessorCollector";
import { Accessor } from "../../resolver/callExpressions/AbstractCollector";
import { getAdditionalRelationships } from "./CallExpressionResolver";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Configuration } from "../../Configuration";
import { TreeParser } from "../../helper/TreeParser";

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

    constructor(
        config: Configuration,
        allNodeTypes: NodeTypeConfig[],
        namespaceCollector: NamespaceCollector,
        usageCollector: UsagesCollector,
        publicAccessorCollector: PublicAccessorCollector,
    ) {
        this.config = config;
        this.namespaceCollector = namespaceCollector;
        this.usageCollector = usageCollector;
        this.publicAccessorCollector = publicAccessorCollector;
    }

    calculate(parseFiles: ParsedFile[]) {
        let namespaces: Map<string, FullyQTN> = new Map();
        const publicAccessors = new Map<string, Accessor[]>();
        let usagesCandidates: TypeUsageCandidate[] = [];
        const unresolvedCallExpressions = new Map<string, UnresolvedCallExpression[]>();

        // preprocessing
        for (const parseFile of parseFiles) {
            namespaces = new Map([
                ...namespaces,
                ...this.namespaceCollector.getNamespaces(parseFile),
            ]);

            const moreAccessors = this.publicAccessorCollector.getPublicAccessors(
                parseFile,
                this.namespaceCollector.getNamespaces(parseFile),
            );
            for (const [accessorName, accessors] of moreAccessors) {
                const existingAccessors = publicAccessors.get(accessorName);
                if (existingAccessors !== undefined) {
                    existingAccessors.push(...accessors);
                } else {
                    publicAccessors.set(accessorName, accessors);
                }
            }
        }

        // processing
        for (const parseFile of parseFiles) {
            const { candidates, unresolvedCallExpressions: callExpressionsOfFile } =
                this.usageCollector.getUsageCandidates(parseFile, this.namespaceCollector);
            usagesCandidates = usagesCandidates.concat(candidates);
            unresolvedCallExpressions.set(parseFile.filePath, callExpressionsOfFile);
        }

        // postprocessing

        dlog("\n\n");
        dlog("namespaces", namespaces, "\n\n");
        dlog("usages", usagesCandidates);
        dlog("\n\n", "unresolved call expressions", unresolvedCallExpressions, "\n\n");
        dlog("\n\n", "publicAccessors", publicAccessors, "\n\n");

        let relationships = this.getRelationships(namespaces, usagesCandidates);
        dlog("\n\n", relationships);

        let couplingMetrics = this.calculateCouplingMetrics(relationships);
        const tree = this.buildDependencyTree(relationships, couplingMetrics).tree;

        const additionalRelationships = getAdditionalRelationships(
            tree,
            unresolvedCallExpressions,
            publicAccessors,
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
        if (!isParsedFile(parsedFile)) {
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
        if (this.config.needsPrintPathFormatting()) {
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
