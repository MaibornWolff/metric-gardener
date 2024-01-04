import { ExpressionMetricMapping } from "../../helper/Model";
import { FullyQTN } from "../../resolver/fullyQualifiedTypeNames/AbstractCollector";
import {
    UnresolvedCallExpression,
    TypeUsageCandidate,
} from "../../resolver/typeUsages/AbstractCollector";
import { NamespaceCollector } from "../../resolver/NamespaceCollector";
import { UsagesCollector } from "../../resolver/UsagesCollector";
import { CouplingMetric, Relationship, ParseFile, CouplingMetrics } from "../Metric";
import { getParseFile } from "../../helper/Helper";
import { PublicAccessorCollector } from "../../resolver/PublicAccessorCollector";
import { Accessor } from "../../resolver/callExpressions/AbstractCollector";
import { getAdditionalRelationships } from "./CallExpressionResolver";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Coupling implements CouplingMetric {
    private namespaceCollector: NamespaceCollector;
    private publicAccessorCollector: PublicAccessorCollector;
    private usageCollector: UsagesCollector;
    private filesWithMultipleNamespaces: ParseFile[] = [];
    private alreadyAddedRelationships = new Set<string>();

    constructor(
        allNodeTypes: ExpressionMetricMapping[],
        namespaceCollector: NamespaceCollector,
        usageCollector: UsagesCollector,
        publicAccessorCollector: PublicAccessorCollector
    ) {
        this.namespaceCollector = namespaceCollector;
        this.usageCollector = usageCollector;
        this.publicAccessorCollector = publicAccessorCollector;
    }

    calculate(parseFiles: ParseFile[]) {
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
                this.namespaceCollector.getNamespaces(parseFile)
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
        const { tree, rootFiles } = this.buildDependencyTree(relationships, couplingMetrics);

        const additionalRelationships = getAdditionalRelationships(
            tree,
            unresolvedCallExpressions,
            publicAccessors,
            this.alreadyAddedRelationships
        );
        relationships = relationships.concat(additionalRelationships);
        dlog("\n\n", "additionalRelationships", additionalRelationships, "\n\n");

        couplingMetrics = this.calculateCouplingMetrics(relationships);

        return {
            relationships: relationships,
            metrics: couplingMetrics,
        };
    }

    private getRelationships(
        namespaces: Map<string, FullyQTN>,
        usagesCandidates: TypeUsageCandidate[]
    ): Relationship[] {
        return usagesCandidates.flatMap((usage) => {
            const namespaceSource = namespaces.get(usage.usedNamespace);
            const uniqueId = usage.usedNamespace + usage.fromNamespace;

            if (
                namespaceSource !== undefined &&
                !this.alreadyAddedRelationships.has(uniqueId) &&
                usage.fromNamespace !== usage.usedNamespace
            ) {
                this.alreadyAddedRelationships.add(uniqueId);

                // In C# we do not know if a base class is implemented or just extended
                // But if class type is interface, then it must be implemented instead of extended
                const fixedUsageType =
                    usage.usageType === "implements" && namespaceSource.classType !== "interface"
                        ? "extends"
                        : usage.usageType;

                // TODO: fromClassName and toClassName are broken
                //  I think they can be removed if we do not use them anymore.
                return [
                    {
                        fromNamespace: usage.fromNamespace,
                        toNamespace: usage.usedNamespace,
                        fromSource: usage.sourceOfUsing,
                        toSource: namespaceSource.source,
                        fromClassName: namespaceSource.className,
                        toClassName: namespaceSource.className,
                        usageType: fixedUsageType,
                    },
                ];
            }
            return [];
        });
    }

    private buildDependencyTree(
        couplingResults: Relationship[],
        allCouplingMetrics: Map<string, CouplingMetrics>
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
            this.updateMetricsForFile(
                couplingItem.fromSource,
                couplingItem.fromNamespace,
                "outgoing",
                couplingValues,
                couplingItem
            );
            this.updateMetricsForFile(
                couplingItem.toSource,
                couplingItem.toNamespace,
                "incoming",
                couplingValues,
                couplingItem
            );
        }

        dlog("\n\n", couplingValues);
        return couplingValues;
    }

    private updateMetricsForFile(
        filePath: string,
        sourceNamespace: string,
        direction: string,
        couplingValues: Map<string, CouplingMetrics>,
        couplingItem: Relationship
    ) {
        let couplingMetrics = couplingValues.get(filePath);
        if (couplingMetrics === undefined) {
            couplingMetrics = this.getNewCouplingMetrics();
            couplingValues.set(filePath, couplingMetrics);
        }

        const parseFile = getParseFile(filePath);
        if (parseFile === undefined) {
            return;
        }

        const namespaces = this.namespaceCollector.getNamespaces(parseFile);
        if (namespaces.size > 1) {
            this.filesWithMultipleNamespaces.push(parseFile);
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

    getName(): string {
        return "coupling";
    }
}
