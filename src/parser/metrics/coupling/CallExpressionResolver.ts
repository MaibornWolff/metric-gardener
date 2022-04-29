import { Relationship } from "../Metric";
import { Accessor } from "../../resolver/callExpressions/AbstractCollector";
import { UnresolvedCallExpression } from "../../resolver/typeUsages/AbstractCollector";
import { FullyQTN } from "../../resolver/fullyQualifiedTypeNames/AbstractCollector";

export function getAdditionalRelationships(
    tree: Map<string, Relationship[]>,
    unresolvedCallExpressions: Map<string, UnresolvedCallExpression[]>,
    publicAccessors: Map<string, Accessor[]>,
    alreadyAddedRelationships: Set<string>
) {
    let additionalRelationships: Relationship[] = [];

    for (const [filePath, callExpressions] of unresolvedCallExpressions) {
        const fileDependencies = [...(tree.get(filePath) ?? [])];
        if (!fileDependencies) {
            continue;
        }

        console.log("RESOLVING:", fileDependencies);

        const processedPublicAccessors = new Set<string>();

        const fileAdditionalRelationships: Relationship[] = [];

        for (const callExpression of callExpressions) {
            if (processedPublicAccessors.has(callExpression.name)) {
                continue;
            }
            processedPublicAccessors.add(callExpression.name);

            const qualifiedNameParts = callExpression.name.split(callExpression.namespaceDelimiter);
            if (callExpression.variableNameIncluded) {
                qualifiedNameParts.shift();
            }

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
                console.log(
                    "CLONED_ACCESSORS",
                    namePart,
                    filePath,
                    clonedAccessors.length,
                    fileDependencies
                );
                console.log(clonedAccessors);

                let added;

                for (const accessor of clonedAccessors) {
                    if (accessor.namespaces.length === 0) {
                        continue;
                    }

                    // Warning in case of Accessor Conflicts:
                    // In case that multiple accessors would fit the call expression,
                    // add both of them to not lose the correct dependency.
                    // this might lead to higher coupling values,
                    // but it is not that crucial as shown in the master thesis related to MetricGardener
                    for (const namespace of accessor.namespaces) {
                        const fullyQualifiedNameCandidate =
                            namespace.namespace +
                            namespace.namespaceDelimiter +
                            namespace.className;

                        console.log("\n\n", accessor, " -- ", fullyQualifiedNameCandidate);

                        // FirstAccessor is a property or method
                        // The type of myVariable must be an already added dependency of the current base type/class (filePath),
                        // so that subsequent method calls or attribute accesses can be resolved.
                        // Example:
                        // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                        const baseDependency = fileDependencies.find((dependency) => {
                            return dependency.toNamespace === fullyQualifiedNameCandidate;
                        });

                        // In case of chained accesses, look in dependencies added for previous chain elements:
                        // e.g. look up already added dependency of return type of FirstAccessor to resolve SecondAccessor
                        // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                        const callExpressionDependency = fileAdditionalRelationships.find(
                            (dependency) => {
                                return dependency.toNamespace === fullyQualifiedNameCandidate;
                            }
                        );

                        if (baseDependency !== undefined) {
                            added = resolveAccessorReturnType(
                                baseDependency,
                                accessor,
                                namespace,
                                tree,
                                fileAdditionalRelationships,
                                alreadyAddedRelationships
                            );
                        } else if (callExpressionDependency !== undefined) {
                            added = resolveAccessorReturnType(
                                callExpressionDependency,
                                accessor,
                                namespace,
                                tree,
                                fileAdditionalRelationships,
                                alreadyAddedRelationships
                            );
                        }

                        if (added) {
                            // Iterate only for the first namespace of an added accessor:
                            // One namespace of the accessor is fitting and
                            // the corresponding accessor was added as a dependency
                            // It seems not necessary to check the other namespaces of the accessor
                            break;
                        }
                    }
                }
            }
        }

        additionalRelationships = additionalRelationships.concat(fileAdditionalRelationships);
    }

    return additionalRelationships;
}

function resolveAccessorReturnType(
    matchingDependency: Relationship,
    accessor: Accessor,
    namespace: FullyQTN,
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
        matchingDependency,
        "\n\n"
    );

    const accessorFileDependencies = tree.get(namespace.source) ?? [];
    console.log("namespace.source", namespace.source);
    console.log("accessorFileDependencies", accessorFileDependencies);
    for (const accessorFileDependency of accessorFileDependencies) {
        // TODO Imagine that returnType is MyTypeNumberOne
        //  and toClassName MyType
        //  This would lead to a wrong dependency
        // Substring search using includes() is used because Return Types can look very differently:
        // Collection<MyTypeNumberOne>
        // Map<string, MyTypeNumberOne>
        // etc.
        if (accessor.returnType.includes(accessorFileDependency.toClassName)) {
            const uniqueId = accessorFileDependency.toNamespace + matchingDependency.fromNamespace;

            if (alreadyAddedRelationships.has(uniqueId)) {
                console.log(
                    "SKIP ADDING RETURN TYPE: ",
                    accessor.returnType,
                    "already added: ",
                    accessorFileDependency,
                    alreadyAddedRelationships.has(uniqueId),
                    "\n\n"
                );
                continue;
            }

            if (matchingDependency.fromNamespace !== accessorFileDependency.toNamespace) {
                alreadyAddedRelationships.add(uniqueId);

                const dependencyClone: Relationship = {
                    fromNamespace: matchingDependency.fromNamespace,
                    fromSource: matchingDependency.fromSource,
                    implementsCount: 0 /* TODO set right count or remove this property because it is used for testing purposes only */,
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
