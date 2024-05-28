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

type UsageCapture = {
    name: string;
    text: string;
    source: undefined | string;
    usageType: undefined | UsageType;
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
            filePath,
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
        filePath: FilePath,
        typesFromFile: Map<FQTN, TypeInfo>,
        importReferences: Import[],
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const usagesAndCandidates: TypeUsageCandidate[] = [];
        const unresolvedCallExpressions: UnresolvedCallExpression[] = [];

        for (const [FQTN, typeDeclaration] of typesFromFile.entries()) {
            const usageCaptures: UsageCapture[] = this.getUsageCaptures(FQTN, typeDeclaration);

            // Resolve usages against import statements and build concrete usages or usage candidates

            const processedQualifiedName = new Set<string>();
            for (const usageCapture of usageCaptures) {
                const qualifiedNameParts = this.getCleanAndSplitName(usageCapture.text);
                const qualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());

                if (processedQualifiedName.has(qualifiedName)) {
                    continue;
                }

                processedQualifiedName.add(qualifiedName);

                const qualifiedNamePrefix = qualifiedNameParts.shift();
                if (qualifiedNamePrefix === undefined) {
                    continue;
                }

                const resolvedImport = this.fileToTypeNameToImportReference
                    .get(filePath)
                    ?.get(qualifiedNamePrefix);

                const originalCleanQualifiedNameParts = qualifiedName.split(
                    this.getNamespaceDelimiter(),
                );

                const { name, usageType, source } = usageCapture;

                if (resolvedImport === undefined) {
                    this.buildUnresolvedImportCandidates(
                        name,
                        originalCleanQualifiedNameParts,
                        processedQualifiedName,
                        unresolvedCallExpressions,
                        qualifiedName,
                        typeDeclaration,
                        importReferences,
                        filePath,
                        usageType,
                        usagesAndCandidates,
                    );
                } else {
                    this.buildResolvedImportCandidates(
                        name,
                        originalCleanQualifiedNameParts,
                        qualifiedNameParts,
                        unresolvedCallExpressions,
                        qualifiedName,
                        processedQualifiedName,
                        resolvedImport,
                        typeDeclaration,
                        filePath,
                        usageType,
                        usagesAndCandidates,
                    );
                }
            }
        }

        return {
            candidates: usagesAndCandidates,
            unresolvedCallExpressions,
        };
    }

    private buildResolvedImportCandidates(
        name: string,
        originalCleanQualifiedNameParts: string[],
        qualifiedNameParts: string[],
        unresolvedCallExpressions: UnresolvedCallExpression[],
        qualifiedName: string,
        processedQualifiedName: Set<string>,
        resolvedImport: Import,
        typeDeclaration: TypeInfo,
        filePath: string,
        usageType: "usage" | "extends" | "implements" | undefined,
        usagesAndCandidates: TypeUsageCandidate[],
    ): void {
        if (
            name === "call_expression" &&
            this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
        ) {
            // Pop name of called function or similar callables
            if (originalCleanQualifiedNameParts.length > 1) {
                qualifiedNameParts.pop();
            }

            // In case it cannot be resolved by resolvedImport name, try it later again
            unresolvedCallExpressions.push(this.buildCallExpression(qualifiedName));
        }

        const modifiedQualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());
        processedQualifiedName.add(modifiedQualifiedName);

        // Skip current one if invalid space is included in potential class or namespace name
        if (modifiedQualifiedName.includes(" ") || modifiedQualifiedName.includes("<")) {
            return;
        }

        const usageCandidate: TypeUsageCandidate = {
            usedNamespace:
                resolvedImport.importReferenceFullName +
                (qualifiedNameParts.length > 0
                    ? this.getNamespaceDelimiter() + modifiedQualifiedName
                    : ""),
            fromNamespace:
                typeDeclaration.namespace +
                typeDeclaration.namespaceDelimiter +
                typeDeclaration.typeName,
            sourceOfUsing: filePath,
            usageType: usageType ?? "usage",
        };
        usagesAndCandidates.push(usageCandidate);

        if (resolvedImport.alias !== "" && this.noImportForClassesInSameOrParentNamespaces()) {
            // In This case, alias can be a Qualified Name
            // Add Same Namespace Candidate
            // Add Parent Namespace Candidate
            const fromNamespaceParts = typeDeclaration.namespace.split(
                this.getNamespaceDelimiter(),
            );
            while (fromNamespaceParts.length > 0) {
                const usageCandidate: TypeUsageCandidate = {
                    usedNamespace:
                        fromNamespaceParts.join(this.getNamespaceDelimiter()) +
                        typeDeclaration.namespaceDelimiter +
                        resolvedImport.importReferenceFullName,
                    fromNamespace:
                        typeDeclaration.namespace +
                        typeDeclaration.namespaceDelimiter +
                        typeDeclaration.typeName,
                    sourceOfUsing: filePath,
                    usageType: usageType ?? "usage",
                };
                usagesAndCandidates.push(usageCandidate);
                fromNamespaceParts.pop();
            }
        }
    }

    private buildUnresolvedImportCandidates(
        name: string,
        originalCleanQualifiedNameParts: string[],
        processedQualifiedName: Set<string>,
        unresolvedCallExpressions: UnresolvedCallExpression[],
        qualifiedName: string,
        typeDeclaration: TypeInfo,
        importReferences: Import[],
        filePath: string,
        usageType: "usage" | "extends" | "implements" | undefined,
        usagesAndCandidates: TypeUsageCandidate[],
    ): void {
        if (
            name === "call_expression" &&
            this.getNamespaceDelimiter() === this.getFunctionCallDelimiter() &&
            originalCleanQualifiedNameParts.length > 1
        ) {
            // Pop name of called function or similar callables from qualified name
            originalCleanQualifiedNameParts.pop();
        }

        const cleanQualifiedName = originalCleanQualifiedNameParts.join(
            this.getNamespaceDelimiter(),
        );
        processedQualifiedName.add(cleanQualifiedName);

        // Skip current one if invalid space is included in potential class or namespace name
        if (cleanQualifiedName.includes(" ") || cleanQualifiedName.includes("<")) {
            return;
        }

        if (name === "call_expression") {
            unresolvedCallExpressions.push(this.buildCallExpression(qualifiedName));
        }

        // For languages that allow the usage of classes in the same namespace without the need of an import:
        // add candidate in same namespace for unresolvable usage

        let usedNamespace = typeDeclaration.namespace;
        if (!cleanQualifiedName.startsWith(typeDeclaration.namespaceDelimiter)) {
            usedNamespace += typeDeclaration.namespaceDelimiter;
        }

        usedNamespace += cleanQualifiedName;

        // For languages that allow the usage of classes in parent namespace without the need of an import:
        // Look in parent namespaces for the used class name even if no import is present

        const parentNamespaceCandidates: string[] = [];
        if (typeDeclaration.namespace.includes(this.getNamespaceDelimiter())) {
            const sourceNamespaceParts = typeDeclaration.namespace.split(
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
                    const clonedNameParts = [...originalCleanQualifiedNameParts];
                    while (clonedNameParts.length > 0) {
                        moreCandidates.push(
                            importReference.importReferenceFullName +
                                typeDeclaration.namespaceDelimiter +
                                clonedNameParts.join(this.getNamespaceDelimiter()),
                        );
                        clonedNameParts.pop();
                    }
                } else {
                    moreCandidates.push(
                        importReference.importReferenceFullName +
                            typeDeclaration.namespaceDelimiter +
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
                    typeDeclaration.namespace +
                    typeDeclaration.namespaceDelimiter +
                    typeDeclaration.typeName,
                sourceOfUsing: filePath,
                usageType: usageType ?? "usage",
            };
            // TODO prevent duplicate adds in current file
            //  when is it a duplicate? (usedNamespace + fromNamespace + sourceOfUsing?)
            usagesAndCandidates.push(usageCandidate);
        }
    }

    private getUsageCaptures(FQTN: FQTN, typeDeclaration: TypeInfo): UsageCapture[] {
        const usageCaptures: UsageCapture[] = this.getBaseClassAndInterfaceUsageCaptures(
            FQTN,
            typeDeclaration,
        );

        const usagesQuery = this.getUsagesQuery();
        let captures: QueryCapture[] = [];
        if (usagesQuery !== undefined) {
            captures = usagesQuery.captures(typeDeclaration.node!);
        }

        for (const capture of captures) {
            usageCaptures.push({
                name: capture.name,
                text: capture.node.text,
                usageType: "usage",
                source: FQTN,
            });
        }

        dlog("class/object usages", usageCaptures);
        return usageCaptures;
    }

    private getBaseClassAndInterfaceUsageCaptures(FQTN: FQTN, typeInfo: TypeInfo): UsageCapture[] {
        const usagesTextCaptures: UsageCapture[] = [];

        // Add implemented and extended classes as usages
        // to consider the coupling of those
        if (typeInfo.implementedFrom.length > 0) {
            for (const implementedClass of typeInfo.implementedFrom) {
                usagesTextCaptures.push({
                    name: "qualified_name",
                    text: implementedClass,
                    usageType: "implements",
                    source: FQTN,
                });
            }
        }

        if (typeInfo.extendedFrom !== undefined) {
            usagesTextCaptures.push({
                name: "qualified_name",
                text: typeInfo.extendedFrom,
                usageType: "extends",
                source: FQTN,
            });
        }

        return usagesTextCaptures;
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

    private getCleanAndSplitName(text: string): string[] {
        const qualifiedNameParts = text.split(this.getNamespaceDelimiter());
        const cleanNameParts = qualifiedNameParts.map((namePart) => {
            if (namePart.endsWith("[]") || namePart.endsWith("()")) {
                return namePart.slice(0, Math.max(0, namePart.length - 2));
            }

            if (namePart.endsWith("?")) {
                return namePart.slice(0, Math.max(0, namePart.length - 1));
            }

            return namePart;
        });
        return cleanNameParts;
    }
}
