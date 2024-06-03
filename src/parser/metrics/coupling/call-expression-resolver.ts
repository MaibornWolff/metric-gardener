import { debuglog, type DebugLoggerFunction } from "node:util";
import { type Relationship } from "../metric.js";
import { type Accessor } from "../../resolver/accessors/abstract-collector.js";
import { type CallExpression } from "../../resolver/call-expressions/abstract-collector.js";
import { type TypeInfo } from "../../resolver/types/abstract-collector.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export function getRelationshipsFromCallExpressions(
    fileToRelations: Map<string, Relationship[]>,
    fileToCallExpressions: Map<string, CallExpression[]>,
    accessorNameToAccessors: Map<string, Accessor[]>,
    alreadyAddedRelationships: Set<string>,
): Relationship[] {
    const additionalRelationships: Relationship[] = [];

    for (const [filePath, callExpressions] of fileToCallExpressions) {
        const fileDependencies = fileToRelations.get(filePath) ?? [];

        dlog("RESOLVING:", fileDependencies);

        const processedCallExpressions = new Set<string>();

        const fileAdditionalRelationships: Relationship[] = [];

        for (const callExpression of callExpressions) {
            if (processedCallExpressions.has(callExpression.qualifiedName)) {
                continue;
            }

            processedCallExpressions.add(callExpression.qualifiedName);

            const qualifiedNameParts = callExpression.qualifiedName.split(
                callExpression.namespaceDelimiter,
            );
            if (callExpression.variableNameIncluded) {
                qualifiedNameParts.shift();
            }

            for (let namePart of qualifiedNameParts) {
                // Remove save call character
                if (namePart.endsWith("?")) {
                    namePart = namePart.slice(0, Math.max(0, namePart.length - 1));
                }

                const publicAccessorsOfPrefix = accessorNameToAccessors.get(namePart);
                if (publicAccessorsOfPrefix === undefined) {
                    continue;
                }

                const clonedAccessors = [...publicAccessorsOfPrefix];
                dlog(
                    "CLONED_ACCESSORS",
                    namePart,
                    filePath,
                    clonedAccessors.length,
                    fileDependencies,
                );
                dlog(clonedAccessors.toString());

                let added;

                for (const accessor of clonedAccessors) {
                    if (!accessor.fromType) {
                        continue;
                    }

                    const type = accessor.fromType;
                    const fullyQualifiedNameCandidate =
                        type.namespace + type.namespaceDelimiter + type.typeName;

                    dlog("\n\n", accessor, " -- ", fullyQualifiedNameCandidate);

                    // FirstAccessor is a property or method
                    // The type of myVariable must be an already added dependency of the current base type/class (filePath),
                    // so that subsequent method calls or attribute accesses can be resolved.
                    // Example:
                    // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                    const baseDependency = fileDependencies.find((dependency) => {
                        return dependency.toFQTN === fullyQualifiedNameCandidate;
                    });

                    // In case of chained accesses, look in dependencies added for previous chain elements:
                    // e.g. look up already added dependency of return type of FirstAccessor to resolve SecondAccessor
                    // myVariable.FirstAccessor.SecondAccessor.ThirdAccessor
                    const callExpressionDependency = fileAdditionalRelationships.find(
                        (dependency) => {
                            return dependency.toFQTN === fullyQualifiedNameCandidate;
                        },
                    );

                    if (baseDependency !== undefined) {
                        added = resolveAccessorReturnType(
                            baseDependency,
                            accessor,
                            type,
                            fileToRelations,
                            fileAdditionalRelationships,
                            alreadyAddedRelationships,
                        );
                    } else if (callExpressionDependency !== undefined) {
                        added = resolveAccessorReturnType(
                            callExpressionDependency,
                            accessor,
                            type,
                            fileToRelations,
                            fileAdditionalRelationships,
                            alreadyAddedRelationships,
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

        additionalRelationships.push(...fileAdditionalRelationships);
    }

    return additionalRelationships;
}

function resolveAccessorReturnType(
    matchingDependency: Relationship,
    accessor: Accessor,
    fromType: TypeInfo,
    fileToRelationships: Map<string, Relationship[]>,
    additionalRelationships: Relationship[],
    alreadyAddedRelationships: Set<string>,
): number {
    // TODO resolve return type (generics, etc.)
    dlog(
        "Lookup Status: ",
        Boolean(matchingDependency),
        " -> check return type add: ",
        accessor.returnType,
        matchingDependency,
        "\n\n",
    );

    const accessorFileDependencies = fileToRelationships.get(fromType.sourceFile) ?? [];
    dlog("namespace.source", fromType.sourceFile);
    dlog("accessorFileDependencies", accessorFileDependencies);
    for (const accessorFileDependency of accessorFileDependencies) {
        // TODO Imagine that returnType is MyTypeNumberOne
        //  and toTypeName MyType
        //  This would lead to a wrong dependency
        // Substring search using includes() is used because Return Types can look very differently:
        // Collection<MyTypeNumberOne>
        // Map<string, MyTypeNumberOne>
        // etc.
        if (accessor.returnType.includes(accessorFileDependency.toTypeName)) {
            const uniqueId = accessorFileDependency.toFQTN + matchingDependency.fromFQTN;

            if (alreadyAddedRelationships.has(uniqueId)) {
                dlog(
                    "SKIP ADDING RETURN TYPE: ",
                    accessor.returnType,
                    "already added: ",
                    accessorFileDependency,
                    alreadyAddedRelationships.has(uniqueId),
                    "\n\n",
                );
                continue;
            }

            if (matchingDependency.fromFQTN !== accessorFileDependency.toFQTN) {
                alreadyAddedRelationships.add(uniqueId);

                const dependencyClone: Relationship = {
                    fromFQTN: matchingDependency.fromFQTN,
                    fromFile: matchingDependency.fromFile,
                    toTypeName: accessorFileDependency.toTypeName,
                    fromTypeName: matchingDependency.fromTypeName,
                    toFQTN: accessorFileDependency.toFQTN,
                    toFile: accessorFileDependency.toFile,
                    usageType: "usage",
                };

                dlog("ADD RETURN TYPE: ", accessor.returnType, dependencyClone, "\n\n");
                return additionalRelationships.push(dependencyClone);
            }

            return 0;
        }
    }

    return 0;
}
