import { CouplingMetrics, Relationship } from "../Metric";

export function countTransitiveImplements(
    dependencyTree: Map<string, Relationship[]>,
    allCouplingMetrics: Map<string, CouplingMetrics>
) {
    const additionalDependencies: Relationship[] = [];

    for (const [sourceFile, metricsOfFile] of allCouplingMetrics) {
        const alreadyProcessedFiles = new Set<string>();
        let totalAdditionalCoupling = 0;
        const additionalFileDependencies: Relationship[] = [];

        const treeItem = dependencyTree.get(sourceFile) ?? [];
        console.log("START TRANSIVITVES FOR: ", sourceFile);
        for (const dependency of treeItem) {
            //if (dependency.usageType === "implements" || dependency.usageType === "extends") {
            if (dependency.usageType === "implements") {
                alreadyProcessedFiles.add(sourceFile);

                // Do not count first implements of given class
                // This is already done by standard algorithm
                // Go to second level:
                const subTreeItem = dependencyTree.get(dependency.toSource) ?? [];
                console.log(
                    "TRANSITIVE",
                    dependency,
                    dependency.fromSource,
                    subTreeItem,
                    totalAdditionalCoupling
                );

                totalAdditionalCoupling += resolveImplementsChain(
                    dependencyTree,
                    subTreeItem,
                    0,
                    additionalFileDependencies,
                    alreadyProcessedFiles,
                    allCouplingMetrics
                );
                console.log(totalAdditionalCoupling);
            }
        }

        // TODO update all affected metrics like instability
        console.log("ACCUMLUATE for: ", sourceFile, ": ", totalAdditionalCoupling);
        metricsOfFile.outgoing_dependencies += totalAdditionalCoupling;

        // relationships must be cloned and changed with adjusted from attributes and so on.
        if (sourceFile.includes("DirectErrorResponseTests")) {
            console.log("DirectErrorResponseTests", additionalFileDependencies);
        }
        for (const additionalRelationship of additionalFileDependencies) {
            const modifiedRelationship: Relationship = {
                fromNamespace: treeItem[0].fromNamespace,
                fromClassName: treeItem[0].fromClassName,
                fromSource: treeItem[0].fromSource,
                toNamespace: additionalRelationship.toNamespace,
                toClassName: additionalRelationship.toClassName,
                toSource: additionalRelationship.toSource,
                usageType: "implements",
            };

            additionalDependencies.push(modifiedRelationship);
        }
    }

    return additionalDependencies;
}

function resolveImplementsChain(
    dependencyTree: Map<string, Relationship[]>,
    subTreeItem: Relationship[],
    additionalCoupling: number,
    additionalTransitiveDependencies: Relationship[],
    alreadyProcessedFiles: Set<string>,
    allCouplingMetrics: Map<string, CouplingMetrics>
) {
    for (const subDependency of subTreeItem) {
        //if (subDependency.usageType === "implements" || subDependency.usageType === "extends") {
        if (subDependency.usageType === "implements") {
            if (alreadyProcessedFiles.has(subDependency.fromSource)) {
                continue;
            }

            alreadyProcessedFiles.add(subDependency.fromSource);

            // Count second (transitive) level of implements
            const metricsOfImplementedClass = allCouplingMetrics.get(subDependency.toSource);
            if (
                metricsOfImplementedClass !== undefined &&
                metricsOfImplementedClass.namespace.length > 1
            ) {
                console.log(
                    "SHOULD BE SKIPPED Because implemented class is a multiple type file:",
                    subDependency.toSource
                );
                // TODO skip additional transitive coupling for multiple type files
                //  this must be done to be able to compare our results against Structure101
                //  Remove this before release
            } else {
                additionalCoupling++;
                additionalTransitiveDependencies.push(subDependency);
                console.log(
                    "COUNT ++ for: ",
                    subDependency.toSource,
                    "--- to: ",
                    additionalCoupling
                );
            }

            const subTreeItem = dependencyTree.get(subDependency.toSource) ?? [];
            if (subTreeItem.length > 0) {
                additionalCoupling = resolveImplementsChain(
                    dependencyTree,
                    subTreeItem,
                    additionalCoupling,
                    additionalTransitiveDependencies,
                    alreadyProcessedFiles,
                    allCouplingMetrics
                );
            }
        }
    }

    return additionalCoupling;
}
