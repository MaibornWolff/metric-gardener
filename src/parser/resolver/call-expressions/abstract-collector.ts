import { debuglog, type DebugLoggerFunction } from "node:util";
import { type Query, type QueryCapture, type QueryMatch, type Tree } from "tree-sitter";
import { type ParsedFile, type UsageType } from "../../metrics/metric.js";
import { type TypeInfo } from "../types/abstract-collector.js";
import { GroupedImportMatch, type ImportMatch, SimpleImportMatch } from "./import-match.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export type Import = {
    importReferenceFullName: string;
    importReference: string;
    alias: string;
};

export type TypeUsageCandidate = {
    usedNamespace: string;
    fromNamespace: string;
    sourceOfUsing: string;
    usageType: UsageType;
};

export type UnresolvedCallExpression = {
    name: string;
    variableNameIncluded: boolean;
    namespaceDelimiter: string;
};

export abstract class AbstractCollector {
    private readonly fileToTypeNameToImportReference = new Map<string, Map<string, Import>>();

    getUsageCandidates(
        parsedFile: ParsedFile,
        typesFromFile: Map<string, TypeInfo>,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const { filePath } = parsedFile;
        this.fileToTypeNameToImportReference.set(filePath, new Map());

        const importReferences = this.getImports(parsedFile);

        dlog("Alias Map:", filePath, this.fileToTypeNameToImportReference);
        dlog("Import References", filePath, importReferences);

        const { candidates, unresolvedCallExpressions } = this.getUsages(
            parsedFile,
            typesFromFile,
            importReferences,
        );
        dlog("UsagesAndCandidates", filePath, candidates);

        return {
            candidates,
            unresolvedCallExpressions,
        };
    }

    // In C# for example,
    // it is not possible to know which usage belongs to which import
    // Imagine:
    // using System;
    // Console.WriteLine("foo");
    // You cannot be sure that the Console.WriteLine (partial) namespace
    // belongs to the used namespace "System"
    protected abstract indirectNamespaceReferencing(): boolean;
    protected abstract noImportForClassesInSameOrParentNamespaces(): boolean;
    protected abstract getFunctionCallDelimiter(): string;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getImportsQuery(): Query;
    protected abstract getUsagesQuery(): Query;

    private getImports(parsedFile: ParsedFile): Import[] {
        const { filePath, tree } = parsedFile;

        const queryMatches = this.getQueryMatchesFromTree(tree, this.getImportsQuery());

        const importReferences = queryMatches.map((queryMatch): Import => {
            return this.buildImportReference(queryMatch, filePath);
        });

        dlog(importReferences.toString());

        return importReferences;
    }

    private buildImportReference(queryMatch: QueryMatch, filePath: string): Import {
        const importMatch: ImportMatch = this.isGroupedImportMatch(queryMatch)
            ? new GroupedImportMatch(queryMatch.captures)
            : new SimpleImportMatch(queryMatch.captures);

        const importReference = importMatch.toImport(this.getNamespaceDelimiter());

        this.fileToTypeNameToImportReference
            .get(filePath)
            ?.set(
                importReference.alias.length > 0
                    ? importReference.alias
                    : importReference.importReference,
                importReference,
            );
        return importReference;
    }

    private getQueryMatchesFromTree(tree: Tree, importsQuery: Query): QueryMatch[] {
        let queryMatches: QueryMatch[] = [];
        if (importsQuery !== undefined) {
            queryMatches = importsQuery.matches(tree.rootNode);
        }

        return queryMatches;
    }

    private isGroupedImportMatch(queryMatch: QueryMatch): boolean {
        return queryMatch.captures[0].name.startsWith("grouped");
    }

    private getUsages(
        parsedFile: ParsedFile,
        typesFromFile: Map<string, TypeInfo>,
        importReferences: Import[],
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const { filePath, tree } = parsedFile;

        const usagesQuery = this.getUsagesQuery();
        let usagesCaptures: QueryCapture[] = [];
        if (usagesQuery !== undefined) {
            usagesCaptures = usagesQuery.captures(tree.rootNode);
        }

        const usagesTextCaptures: Array<{
            name: string;
            text: string;
            source: undefined | string;
            usageType: undefined | UsageType;
        }> = usagesCaptures.map((capture) => {
            return {
                name: capture.name,
                text: capture.node.text,
                usageType: undefined,
                source: undefined,
            };
        });

        dlog("class/object usages", usagesTextCaptures);

        const usagesAndCandidates: TypeUsageCandidate[] = [];
        const unresolvedCallExpressions: UnresolvedCallExpression[] = [];

        // Add implemented and extended classes as usages
        // to consider the coupling of those
        for (const [FQTN, FQTNInfo] of typesFromFile) {
            if (FQTNInfo.implementedFrom.length > 0) {
                for (const implementedClass of FQTNInfo.implementedFrom) {
                    usagesTextCaptures.push({
                        name: "qualified_name",
                        text: implementedClass,
                        usageType: "implements",
                        source: FQTN,
                    });
                }
            }

            if (FQTNInfo.extendedFrom !== undefined) {
                usagesTextCaptures.push({
                    name: "qualified_name",
                    text: FQTNInfo.extendedFrom,
                    usageType: "extends",
                    source: FQTN,
                });
            }
        }

        // Resolve usages against import statements and build concrete usages or usage candidates

        const processedQualifiedNames = new Set<string>();
        for (const usagesTextCapture of usagesTextCaptures) {
            const { name, usageType, source } = usagesTextCapture;
            let qualifiedName = usagesTextCapture.text;

            if (
                processedQualifiedNames.has(qualifiedName) ||
                (name !== "qualified_name" && name !== "call_expression")
            ) {
                continue;
            }

            processedQualifiedNames.add(qualifiedName);

            const qualifiedNameParts = qualifiedName.split(this.getNamespaceDelimiter());
            const cleanNameParts = qualifiedNameParts.map((namePart) => {
                if (namePart.endsWith("[]") || namePart.endsWith("()")) {
                    return namePart.slice(0, Math.max(0, namePart.length - 2));
                }

                if (namePart.endsWith("?")) {
                    return namePart.slice(0, Math.max(0, namePart.length - 1));
                }

                return namePart;
            });

            qualifiedName = cleanNameParts.join(this.getNamespaceDelimiter());

            const qualifiedNamePrefix = cleanNameParts.shift();
            if (qualifiedNamePrefix === undefined) {
                continue;
            }

            const resolvedImport = this.fileToTypeNameToImportReference
                .get(filePath)
                ?.get(qualifiedNamePrefix);

            const FQTNInfos = typesFromFile.values();
            let fromFQTN = FQTNInfos.next().value as TypeInfo | undefined;
            if (!fromFQTN) {
                // No namespace found in current file
                break;
            }

            // Resolve the right entity/class/namespace in a file with multiple ones
            if (source !== undefined) {
                for (const [temporaryKey, temporaryValue] of typesFromFile.entries()) {
                    if (temporaryKey === source) {
                        fromFQTN = temporaryValue;
                    }
                }
            }

            const originalCleanNameParts = qualifiedName.split(this.getNamespaceDelimiter());

            if (resolvedImport === undefined) {
                if (
                    name === "call_expression" &&
                    this.getNamespaceDelimiter() === this.getFunctionCallDelimiter() &&
                    originalCleanNameParts.length > 1
                ) {
                    // Pop name of called function or similar callables from qualified name
                    originalCleanNameParts.pop();
                }

                const cleanQualifiedName = originalCleanNameParts.join(
                    this.getNamespaceDelimiter(),
                );
                processedQualifiedNames.add(cleanQualifiedName);

                // Skip current one if invalid space is included in potential class or namespace name
                if (cleanQualifiedName.includes(" ") || cleanQualifiedName.includes("<")) {
                    continue;
                }

                if (name === "call_expression") {
                    unresolvedCallExpressions.push(this.buildCallExpression(qualifiedName));
                }

                // For languages that allow the usage of classes in the same namespace without the need of an import:
                // add candidate in same namespace for unresolvable usage

                let usedNamespace = fromFQTN.namespace;
                if (!cleanQualifiedName.startsWith(fromFQTN.namespaceDelimiter)) {
                    usedNamespace += fromFQTN.namespaceDelimiter;
                }

                usedNamespace += cleanQualifiedName;

                // For languages that allow the usage of classes in parent namespace without the need of an import:
                // Look in parent namespaces for the used class name even if no import is present

                const parentNamespaceCandidates: string[] = [];
                if (fromFQTN.namespace.includes(this.getNamespaceDelimiter())) {
                    const sourceNamespaceParts = fromFQTN.namespace.split(
                        this.getNamespaceDelimiter(),
                    );
                    while (sourceNamespaceParts.length > 1) {
                        sourceNamespaceParts.pop();

                        const candidate =
                            sourceNamespaceParts.join(this.getNamespaceDelimiter()) +
                            this.getNamespaceDelimiter() +
                            cleanQualifiedName;
                        parentNamespaceCandidates.push(candidate);
                    }
                }

                // Heavy candidate building
                // combine current usage with all of the imports
                const moreCandidates: string[] = [];
                if (this.indirectNamespaceReferencing()) {
                    for (const importReference of importReferences) {
                        if (this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()) {
                            const clonedNameParts = [...originalCleanNameParts];
                            while (clonedNameParts.length > 0) {
                                moreCandidates.push(
                                    importReference.importReferenceFullName +
                                        fromFQTN.namespaceDelimiter +
                                        clonedNameParts.join(this.getNamespaceDelimiter()),
                                );
                                clonedNameParts.pop();
                            }
                        } else {
                            moreCandidates.push(
                                importReference.importReferenceFullName +
                                    fromFQTN.namespaceDelimiter +
                                    cleanQualifiedName,
                            );
                        }
                    }
                }

                // Also, add candidate with exact used namespace
                // in the case that it is a fully qualified (root) namespace

                const finalCandidates = [
                    usedNamespace,
                    cleanQualifiedName,
                    ...moreCandidates,
                    ...parentNamespaceCandidates,
                ];
                for (const candidateUsedNamespace of finalCandidates) {
                    const usageCandidate: TypeUsageCandidate = {
                        usedNamespace: candidateUsedNamespace,
                        fromNamespace:
                            fromFQTN.namespace + fromFQTN.namespaceDelimiter + fromFQTN.typeName,
                        sourceOfUsing: filePath,
                        usageType: usageType ?? "usage",
                    };
                    // TODO prevent duplicate adds in current file
                    //  when is it a duplicate? (usedNamespace + fromNamespace + sourceOfUsing?)
                    usagesAndCandidates.push(usageCandidate);
                }
            } else {
                if (
                    name === "call_expression" &&
                    this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
                ) {
                    // Pop name of called function or similar callables
                    if (originalCleanNameParts.length > 1) {
                        cleanNameParts.pop();
                    }

                    // In case it cannot be resolved by resolvedImport name, try it later again
                    unresolvedCallExpressions.push(this.buildCallExpression(qualifiedName));
                }

                const modifiedQualifiedName = cleanNameParts.join(this.getNamespaceDelimiter());
                processedQualifiedNames.add(modifiedQualifiedName);

                // Skip current one if invalid space is included in potential class or namespace name
                if (modifiedQualifiedName.includes(" ") || modifiedQualifiedName.includes("<")) {
                    continue;
                }

                const usageCandidate: TypeUsageCandidate = {
                    usedNamespace:
                        resolvedImport.importReferenceFullName +
                        (cleanNameParts.length > 0
                            ? this.getNamespaceDelimiter() + modifiedQualifiedName
                            : ""),
                    fromNamespace:
                        fromFQTN.namespace + fromFQTN.namespaceDelimiter + fromFQTN.typeName,
                    sourceOfUsing: filePath,
                    usageType: usageType ?? "usage",
                };
                usagesAndCandidates.push(usageCandidate);

                if (
                    resolvedImport.alias !== "" &&
                    this.noImportForClassesInSameOrParentNamespaces()
                ) {
                    // In This case, alias can be a Qualified Name
                    // Add Same Namespace Candidate
                    // Add Parent Namespace Candidate
                    const fromNamespaceParts = fromFQTN.namespace.split(
                        this.getNamespaceDelimiter(),
                    );
                    while (fromNamespaceParts.length > 0) {
                        const usageCandidate: TypeUsageCandidate = {
                            usedNamespace:
                                fromNamespaceParts.join(this.getNamespaceDelimiter()) +
                                fromFQTN.namespaceDelimiter +
                                resolvedImport.importReferenceFullName,
                            fromNamespace:
                                fromFQTN.namespace +
                                fromFQTN.namespaceDelimiter +
                                fromFQTN.typeName,
                            sourceOfUsing: filePath,
                            usageType: usageType ?? "usage",
                        };
                        usagesAndCandidates.push(usageCandidate);
                        fromNamespaceParts.pop();
                    }
                }
            }
        }

        return {
            candidates: usagesAndCandidates,
            unresolvedCallExpressions,
        };
    }

    private buildCallExpression(qualifiedName: string): {
        name: string;
        variableNameIncluded: boolean;
        namespaceDelimiter: string;
    } {
        return {
            name: qualifiedName,
            variableNameIncluded:
                this.getNamespaceDelimiter() === this.getFunctionCallDelimiter() &&
                qualifiedName.includes(this.getNamespaceDelimiter()),
            namespaceDelimiter: this.getNamespaceDelimiter(),
        };
    }
}
