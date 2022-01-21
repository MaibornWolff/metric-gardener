import { Relationship } from "../Metric";
import { PublicAccessor } from "../../collectors/accessors/AbstractCollector";
import { UnresolvedCallExpression } from "../../collectors/usages/AbstractCollector";

export function getAdditionalRelationships(
    tree: Map<string, Relationship[]>,
    unresolvedCallExpressions: Map<string, UnresolvedCallExpression[]>,
    publicAccessors: Map<string, PublicAccessor[]>,
    alreadyAddedRelationships: Set<string>
) {
    let additionalRelationships: Relationship[] = [];

    for (const [filePath, callExpressions] of unresolvedCallExpressions) {
        const fileDependencies = tree.get(filePath);
        if (!fileDependencies) {
            continue;
        }

        console.log("RESOLVING:", fileDependencies);

        const processedPublicAccessors = new Set<string>();

        for (const callExpression of callExpressions) {
            if (processedPublicAccessors.has(callExpression.name)) {
                continue;
            }
            processedPublicAccessors.add(callExpression.name);

            const qualifiedNameParts = callExpression.name.split(callExpression.namespaceDelimiter);
            if (callExpression.variableNameIncluded) {
                qualifiedNameParts.shift();
            }

            const callExpressionAdditionals: Relationship[] = [];

            for (let namePart of qualifiedNameParts) {
                // remove save call character
                if (namePart.endsWith("?")) {
                    namePart = namePart.substring(0, namePart.length - 1);
                }

                const publicAccessorsOfPrefix = publicAccessors.get(namePart);
                if (publicAccessorsOfPrefix === undefined) {
                    continue;
                }

                const clonedAccessors = [...publicAccessorsOfPrefix];
                console.log("CLONED_ACCESSORS", namePart, clonedAccessors.length);
                console.log(clonedAccessors);

                let additionalDependenciesAdded = 0;

                for (const accessor of clonedAccessors) {
                    if (accessor.namespaces.length === 0) {
                        continue;
                    }

                    // TODO for multiple Namespaces in one file
                    const fullyQualifiedNameCandidate =
                        accessor.namespaces[0].namespace +
                        accessor.namespaces[0].namespaceDelimiter +
                        accessor.namespaces[0].className;

                    console.log("\n\n", accessor, " -- ", fullyQualifiedNameCandidate);

                    // FirstAccessor is a property or method
                    // The type of myVariable must be a dependency
                    // of the current base type/class (filePath) to be resolvable:
                    // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                    const baseDependency = fileDependencies.find((dependency) => {
                        return dependency.toNamespace === fullyQualifiedNameCandidate;
                    });

                    // In case of chained accesses look in dependencies added for previous chain elements:
                    // e.g. look up already added dependency of return type of FirstAccessor to find SecondAccessor
                    // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                    const callExpressionDependency = callExpressionAdditionals.find(
                        (dependency) => {
                            return dependency.toNamespace === fullyQualifiedNameCandidate;
                        }
                    );

                    let added;
                    if (baseDependency !== undefined) {
                        if (
                            resolveAccessorReturnType(
                                baseDependency,
                                accessor,
                                tree,
                                callExpressionAdditionals,
                                alreadyAddedRelationships
                            )
                        ) {
                            break;
                        }
                    } else if (callExpressionDependency !== undefined) {
                        added = resolveAccessorReturnType(
                            callExpressionDependency,
                            accessor,
                            tree,
                            callExpressionAdditionals,
                            alreadyAddedRelationships
                        );
                    }

                    if (added) {
                        additionalDependenciesAdded++;
                        // TODO uncomment to stop on first added return type
                        //break;
                    }
                }

                if (additionalDependenciesAdded > 1) {
                    console.log(
                        "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
                        additionalDependenciesAdded,
                        namePart
                    );
                    console.log(filePath);
                    console.log(callExpression);
                    console.log(clonedAccessors);
                    console.log(fileDependencies);
                    console.log(callExpressionAdditionals);
                }
            }

            additionalRelationships = additionalRelationships.concat(callExpressionAdditionals);
        }
    }

    return additionalRelationships;
}

function resolveAccessorReturnType(
    matchingDependency: Relationship,
    accessor: PublicAccessor,
    tree: Map<string, Relationship[]>,
    additionalRelationships: Relationship[],
    alreadyAddedRelationships: Set<string>
) {
    // TODO resolve return type (generics, etc.)
    console.log(
        "Lookup Status: ",
        !!matchingDependency,
        " -> check return type add: ",
        accessor.returnType,
        "\n\n"
    );

    const accessorFileDependencies = tree.get(accessor.namespaces[0].source) ?? [];
    for (const accessorFileDependency of accessorFileDependencies) {
        if (accessor.returnType.includes(accessorFileDependency.toClassName)) {
            const uniqueId = accessorFileDependency.toNamespace + matchingDependency.fromNamespace;

            if (alreadyAddedRelationships.has(uniqueId)) {
                console.log(
                    "SKIP ADDING RETURN TYPE: ",
                    accessor.returnType,
                    "already added: ",
                    alreadyAddedRelationships.has(uniqueId),
                    "\n\n"
                );
                return 1;
            }

            if (matchingDependency.fromNamespace !== accessorFileDependency.toNamespace) {
                alreadyAddedRelationships.add(uniqueId);

                const dependencyClone: Relationship = {
                    fromNamespace: matchingDependency.fromNamespace,
                    fromSource: matchingDependency.fromSource,
                    implementsCount: 0 /* TODO set right count or remove this property for testing purposes */,
                    toClassName: accessorFileDependency.toClassName,
                    fromClassName: accessorFileDependency.toClassName,
                    toNamespace: accessorFileDependency.toNamespace,
                    toSource: accessorFileDependency.toSource,
                    usageType: "usage",
                };

                console.log("ADD RETURN TYPE: ", accessor.returnType, dependencyClone, "\n\n");
                return additionalRelationships.push(dependencyClone);
            }

            return 0;
        }
    }

    return 0;
}
