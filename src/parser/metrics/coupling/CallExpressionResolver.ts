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

        // This is done to find calls to an interface that is not directly implemented
        // Instead one implemented interface can implement other interfaces
        // So this is a (hidden) transitive dependency
        const transitiveImplementedFileDependencies: Relationship[] = [];
        for (const fileDependency of fileDependencies) {
            const dependenciesOfUsedClass = tree.get(fileDependency.toSource);
            for (const dependencyOfUsedClass of dependenciesOfUsedClass ?? []) {
                //if ((dependencyOfUsedClass.usageType === "implements" || dependencyOfUsedClass.usageType === "extends") && dependencyOfUsedClass.fromSource !== dependencyOfUsedClass.toSource) {
                if (
                    dependencyOfUsedClass.usageType === "implements" &&
                    dependencyOfUsedClass.fromSource !== dependencyOfUsedClass.toSource
                ) {
                    console.log(
                        "add trasitive implements dependency for",
                        filePath,
                        fileDependency,
                        "dependency:",
                        dependencyOfUsedClass
                    );

                    // TODO: To cover all cases, this must be done recursively
                    //  I am not sure, if this can be removed after Struct101 comparison
                    transitiveImplementedFileDependencies.push({ ...dependencyOfUsedClass });
                }
            }
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

                    // Currently, the first matching accessor is going to be added as a dependency
                    // This might not be correct, if more than one accessors are matching.
                    // TODO in this case: Add both dependencies instead of adding one randomly.
                    //  this probably adds actually not existing dependencies,
                    //  but at the end the real dependency is not lost and included in the results.
                    for (const namespace of accessor.namespaces) {
                        const fullyQualifiedNameCandidate =
                            namespace.namespace +
                            namespace.namespaceDelimiter +
                            namespace.className;

                        console.log("\n\n", accessor, " -- ", fullyQualifiedNameCandidate);

                        const calledDependencyInImplementsChain =
                            transitiveImplementedFileDependencies.find((dependency) => {
                                return dependency.toNamespace === fullyQualifiedNameCandidate;
                            });
                        if (calledDependencyInImplementsChain !== undefined) {
                            calledDependencyInImplementsChain.fromNamespace =
                                fileDependencies[0].fromNamespace;
                            calledDependencyInImplementsChain.fromSource =
                                fileDependencies[0].fromSource;
                            calledDependencyInImplementsChain.usageType = "usage";
                            calledDependencyInImplementsChain.implementsCount = 0;

                            console.log(
                                "Transitive Implements Chain Method called. Add:",
                                calledDependencyInImplementsChain
                            );

                            const uniqueId =
                                calledDependencyInImplementsChain.toNamespace +
                                calledDependencyInImplementsChain.fromNamespace;

                            if (!alreadyAddedRelationships.has(uniqueId)) {
                                fileAdditionalRelationships.push(calledDependencyInImplementsChain);
                                alreadyAddedRelationships.add(uniqueId);
                                if (added) {
                                    console.log("ACCESSOR CONFLICT transitives");
                                }
                                added = 1;
                            }
                            break;
                        }

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
                            const prevAdded = added;

                            added = resolveAccessorReturnType(
                                baseDependency,
                                accessor,
                                namespace,
                                tree,
                                fileAdditionalRelationships,
                                alreadyAddedRelationships
                            );

                            if (added) {
                                if (prevAdded) {
                                    console.log("ACCESSOR CONFLICT baseDependency");
                                }

                                break;
                            }
                        } else if (callExpressionDependency !== undefined) {
                            const prevAdded = added;
                            added = resolveAccessorReturnType(
                                callExpressionDependency,
                                accessor,
                                namespace,
                                tree,
                                fileAdditionalRelationships,
                                alreadyAddedRelationships
                            );
                            if (prevAdded && added) {
                                console.log("ACCESSOR CONFLICT callExpressionDependency");
                            }
                        }

                        if (added) {
                            break;
                        }
                    }

                    if (added) {
                        //break;
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
