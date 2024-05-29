import { debuglog, type DebugLoggerFunction } from "node:util";
import { type TypeInfo } from "../../resolver/types/abstract-collector.js";
import {
    type CallExpression,
    type UsageCandidate,
} from "../../resolver/call-expressions/abstract-collector.js";
import { type TypeCollector } from "../../resolver/type-collector.js";
import { type UsagesCollector } from "../../resolver/usages-collector.js";
import {
    type CouplingMetric,
    type Relationship,
    type ParsedFile,
    type CouplingMetrics,
    type CouplingResult,
    type MetricName,
} from "../metric.js";
import { formatPrintPath } from "../../../helper/helper.js";
import { type PublicAccessorCollector } from "../../resolver/public-accessor-collector.js";
import { type Accessor } from "../../resolver/accessors/abstract-collector.js";
import { type Configuration } from "../../configuration.js";
import { getAdditionalRelationships } from "./call-expression-resolver.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});
export class Coupling implements CouplingMetric {
    private readonly alreadyAddedRelationships = new Set<string>();

    private typesMap = new Map<FQTN, TypeInfo>();
    private readonly publicAccessorsMap = new Map<string, Accessor[]>();
    private readonly usagesCandidates: UsageCandidate[] = [];
    private readonly callExpressions = new Map<string, CallExpression[]>();

    constructor(
        private readonly config: Configuration,
        private readonly typeCollector: TypeCollector,
        private readonly usageCollector: UsagesCollector,
        private readonly publicAccessorCollector: PublicAccessorCollector,
    ) {}

    processFile(parsedFile: ParsedFile): void {
        const typesFromFile: Map<FQTN, TypeInfo> = this.typeCollector.getTypesFromFile(parsedFile);
        this.typesMap = new Map([...this.typesMap, ...typesFromFile]);

        const accessorsFromFile = this.publicAccessorCollector.getPublicAccessorsFromFile(
            parsedFile,
            typesFromFile,
        );
        for (const [accessorName, accessors] of accessorsFromFile) {
            if (this.publicAccessorsMap.get(accessorName) === undefined) {
                this.publicAccessorsMap.set(accessorName, accessors);
            } else {
                this.publicAccessorsMap.get(accessorName)!.push(...accessors);
            }
        }

        const { usageCandidates, callExpressions } = this.usageCollector.getUsageCandidates(
            parsedFile,
            typesFromFile,
        );
        this.usagesCandidates.push(...usageCandidates);
        this.callExpressions.set(parsedFile.filePath, callExpressions);
    }

    calculate(): CouplingResult {
        dlog("\n\n");
        dlog("namespaces", this.typesMap, "\n\n");
        dlog("usages", this.usagesCandidates);
        dlog("\n\n", "unresolved call expressions", this.callExpressions, "\n\n");
        dlog("\n\n", "publicAccessors", this.publicAccessorsMap, "\n\n");

        const relationships = this.getRelationships(this.typesMap, this.usagesCandidates);
        dlog("\n\n", relationships);

        const { tree } = this.buildDependencyTree(relationships);

        const additionalRelationships = getAdditionalRelationships(
            tree,
            this.callExpressions,
            this.publicAccessorsMap,
            this.alreadyAddedRelationships,
        );
        relationships.push(...additionalRelationships);
        dlog("\n\n", "additionalRelationships", additionalRelationships, "\n\n");

        const couplingMetrics = this.calculateCouplingMetrics(relationships);

        return this.formatPrintedPaths(relationships, couplingMetrics);
    }

    getName(): MetricName {
        return "coupling";
    }

    private getRelationships(
        types: Map<FQTN, TypeInfo>,
        usagesCandidates: UsageCandidate[],
    ): Relationship[] {
        return usagesCandidates.flatMap((usage) => {
            const usedNamespaceSource = types.get(usage.usedNamespace);
            const fromNamespaceSource = types.get(usage.fromNamespace);
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

    private buildDependencyTree(relationships: Relationship[]): {
        tree: Map<string, Relationship[]>;
        rootFiles: Set<string>;
    } {
        const tree = new Map<string, Relationship[]>();
        for (const couplingItem of relationships) {
            const treeItem = tree.get(couplingItem.fromSource);
            if (treeItem === undefined) {
                tree.set(couplingItem.fromSource, [couplingItem]);
            } else {
                treeItem.push(couplingItem);
            }
        }

        const rootFiles = this.getRootFiles(relationships);

        return {
            tree,
            rootFiles,
        };

        // TODO cyclic dependency detection
        // for (const rootFile of rootFiles) {
        //     // scan tree for cycles and so on
        // }
    }

    private getRootFiles(relationships: Relationship[]): Set<string> {
        const allFiles = new Map<string, boolean>();
        for (const relationship of relationships) {
            if (!allFiles.has(relationship.fromSource)) {
                allFiles.set(relationship.fromSource, true);
            }

            if (!allFiles.has(relationship.toSource)) {
                allFiles.set(relationship.toSource, false);
            }

            allFiles.set(relationship.toSource, false);
        }

        const rootFiles = new Set<string>();
        for (const [file, isRoot] of allFiles) {
            if (isRoot) {
                rootFiles.add(file);
            }
        }

        return rootFiles;
    }

    private calculateCouplingMetrics(
        relationships: Relationship[],
    ): Map<FilePath, CouplingMetrics> {
        const couplingValues = new Map<string, CouplingMetrics>();
        const outgoingDependenciesByFile = new Map<FilePath, Set<FQTN>>();
        const incomingDependenciesByFile = new Map<FilePath, Set<FQTN>>();

        for (const relationship of relationships) {
            const { fromSource } = relationship;
            const { toSource } = relationship;

            this.addNewCouplingMetricIfNotExists(couplingValues, fromSource);
            this.addNewCouplingMetricIfNotExists(couplingValues, toSource);

            this.updateDependency(outgoingDependenciesByFile, fromSource, toSource);
            this.updateDependency(incomingDependenciesByFile, toSource, fromSource);
        }

        for (const [file, dependencies] of outgoingDependenciesByFile) {
            couplingValues.get(file)!.outgoing_dependencies = dependencies.size;
        }

        for (const [file, dependencies] of incomingDependenciesByFile) {
            couplingValues.get(file)!.incoming_dependencies = dependencies.size;
        }

        for (const couplingValue of couplingValues.values()) {
            couplingValue.coupling_between_objects =
                couplingValue.incoming_dependencies + couplingValue.outgoing_dependencies;
            this.calculateInstability(couplingValue);
        }

        dlog("\n\n", couplingValues);
        return couplingValues;
    }

    private addNewCouplingMetricIfNotExists(
        couplingValues: Map<string, CouplingMetrics>,
        filePath: FilePath,
    ): void {
        if (!couplingValues.has(filePath)) {
            couplingValues.set(filePath, {
                outgoing_dependencies: 0,
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
            });
        }
    }

    private updateDependency(
        dependencyByFile: Map<FilePath, Set<FQTN>>,
        thisFile: string,
        relationFile: string,
    ): void {
        if (!dependencyByFile.has(thisFile)) {
            dependencyByFile.set(thisFile, new Set());
        }

        dependencyByFile.get(thisFile)!.add(relationFile);
    }

    private calculateInstability(couplingMetrics: CouplingMetrics): void {
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
