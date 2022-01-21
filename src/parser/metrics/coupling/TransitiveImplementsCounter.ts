import { CouplingMetrics, Relationship } from "../Metric";

export function countTransitiveImplements(
    dependencyTree: Map<string, Relationship[]>,
    allCouplingMetrics: Map<string, CouplingMetrics>
) {
    for (const [sourceFile, metricsOfFile] of allCouplingMetrics) {
        const alreadyProcessedFiles = new Set<string>();
        let totalAdditionalCoupling = 0;

        const treeItem = dependencyTree.get(sourceFile) ?? [];
        console.log("START TRANSIVITVES FOR: ", sourceFile);
        for (const dependency of treeItem) {
            if (dependency.usageType === "implements") {
                alreadyProcessedFiles.add(sourceFile);

                // Do not count first implements of given class
                // This is already done by standard algorithm
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
                    alreadyProcessedFiles
                );
                console.log(totalAdditionalCoupling);
            }
        }

        // TODO update all affected metrics like instability
        console.log("ACCUMLUATE for: ", sourceFile, ": ", totalAdditionalCoupling);
        metricsOfFile.outgoing_dependencies += totalAdditionalCoupling;
    }
}

function resolveImplementsChain(
    dependencyTree: Map<string, Relationship[]>,
    subTreeItem: Relationship[],
    additionalCoupling: number,
    alreadyProcessedFiles: Set<string>
) {
    for (const subDependency of subTreeItem) {
        if (subDependency.usageType === "implements") {
            if (alreadyProcessedFiles.has(subDependency.fromSource)) {
                continue;
            }

            alreadyProcessedFiles.add(subDependency.fromSource);

            // Count second (transitive) level of implements
            additionalCoupling++;
            console.log("COUNT ++ for: ", subDependency.toSource, "--- to: ", additionalCoupling);

            const subTreeItem = dependencyTree.get(subDependency.toSource) ?? [];
            if (subTreeItem.length > 0) {
                additionalCoupling = resolveImplementsChain(
                    dependencyTree,
                    subTreeItem,
                    additionalCoupling,
                    alreadyProcessedFiles
                );
            }
        }
    }

    return additionalCoupling;
}
