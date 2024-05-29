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
    source: string;
    usageType: UsageType;
};

export type UsageCandidate = {
    usedNamespace: string;
    fromNamespace: string;
    sourceOfUsing: string;
    usageType: UsageType;
};

export type CallExpression = {
    name: string;
    variableNameIncluded: boolean;
    namespaceDelimiter: string;
};

export abstract class AbstractCollector {
    private readonly fileToTypeNameToImportReference = new Map<string, Map<string, Import>>();

    getUsageCandidates(
        parsedFile: ParsedFile,
        typesFromFile: Map<FQTN, TypeInfo>,
    ): {
        usageCandidates: UsageCandidate[];
        callExpressions: CallExpression[];
    } {
        const { filePath } = parsedFile;
        this.fileToTypeNameToImportReference.set(filePath, new Map());

        const importReferences = this.getImports(parsedFile);

        dlog("Alias Map:", filePath, this.fileToTypeNameToImportReference);
        dlog("Import References", filePath, importReferences);

        const { usageCandidates, callExpressions } = this.getUsages(
            filePath,
            typesFromFile,
            importReferences,
        );
        dlog("UsagesAndCandidates", filePath, usageCandidates);

        return {
            usageCandidates,
            callExpressions,
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
    protected abstract importForClassesInSameOrParentNamespaces(): boolean;
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
        usageCandidates: UsageCandidate[];
        callExpressions: CallExpression[];
    } {
        const usagesAndCandidates: UsageCandidate[] = [];
        const callExpressions: CallExpression[] = [];

        for (const [FQTN, typeInfo] of typesFromFile.entries()) {
            const usageCaptures: UsageCapture[] = this.getUsageCaptures(FQTN, typeInfo);

            // Resolve usages against import statements and build concrete usages or usage candidates

            const processedQualifiedNames = new Set<string>();
            for (const usageCapture of usageCaptures) {
                const qualifiedNameParts = this.getCleanAndSplitName(usageCapture.text);
                const qualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());

                if (processedQualifiedNames.has(qualifiedName)) {
                    continue;
                }

                processedQualifiedNames.add(qualifiedName);

                const qualifiedNamePrefix = qualifiedNameParts[0];
                if (qualifiedNamePrefix === undefined) {
                    continue;
                }

                const resolvedImport = this.fileToTypeNameToImportReference
                    .get(filePath)
                    ?.get(qualifiedNamePrefix);

                let processedName: string;
                if (resolvedImport === undefined) {
                    processedName = this.buildUnresolvedImportCandidates(
                        FQTN,
                        usageCapture,
                        qualifiedNameParts,
                        callExpressions,
                        typeInfo,
                        importReferences,
                        filePath,
                        usagesAndCandidates,
                    );
                } else {
                    processedName = this.buildResolvedImportCandidates(
                        FQTN,
                        usageCapture,
                        qualifiedNameParts,
                        callExpressions,
                        resolvedImport,
                        typeInfo,
                        filePath,
                        usagesAndCandidates,
                    );
                }

                processedQualifiedNames.add(processedName);
            }
        }

        return {
            usageCandidates: usagesAndCandidates,
            callExpressions,
        };
    }

    private buildResolvedImportCandidates(
        FQTN: FQTN,
        usageCapture: UsageCapture,
        qualifiedNameParts: string[],
        callExpressions: CallExpression[],
        resolvedImport: Import,
        typeInfo: TypeInfo,
        filePath: string,
        usagesAndCandidates: UsageCandidate[],
    ): string {
        const modifiedQualifiedNameParts = [...qualifiedNameParts];
        modifiedQualifiedNameParts.shift();

        if (
            usageCapture.name === "call_expression" &&
            this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
        ) {
            // Pop name of called function or similar callables
            if (qualifiedNameParts.length > 1) {
                modifiedQualifiedNameParts.pop();
            }

            // In case it cannot be resolved by resolvedImport name, try it later again
            callExpressions.push(this.buildCallExpression(qualifiedNameParts));
        }

        const modifiedQualifiedName = modifiedQualifiedNameParts.join(this.getNamespaceDelimiter());

        // Skip current one if invalid space is included in potential class or namespace name
        if (modifiedQualifiedName.includes(" ") || modifiedQualifiedName.includes("<")) {
            return modifiedQualifiedName;
        }

        const usageCandidate: UsageCandidate = {
            usedNamespace:
                resolvedImport.importReferenceFullName +
                (modifiedQualifiedNameParts.length > 0
                    ? this.getNamespaceDelimiter() + modifiedQualifiedName
                    : ""),
            fromNamespace: FQTN,
            sourceOfUsing: filePath,
            usageType: usageCapture.usageType,
        };
        usagesAndCandidates.push(usageCandidate);

        if (resolvedImport.alias !== "" && !this.importForClassesInSameOrParentNamespaces()) {
            // In This case, alias can be a Qualified Name
            // Add Same Namespace Candidate
            // Add Parent Namespace Candidate
            const fromNamespaceParts = typeInfo.namespace.split(this.getNamespaceDelimiter());
            while (fromNamespaceParts.length > 0) {
                const usageCandidate: UsageCandidate = {
                    usedNamespace:
                        fromNamespaceParts.join(this.getNamespaceDelimiter()) +
                        typeInfo.namespaceDelimiter +
                        resolvedImport.importReferenceFullName,
                    fromNamespace: FQTN,
                    sourceOfUsing: filePath,
                    usageType: usageCapture.usageType,
                };
                usagesAndCandidates.push(usageCandidate);
                fromNamespaceParts.pop();
            }
        }

        return modifiedQualifiedName;
    }

    private buildUnresolvedImportCandidates(
        FQTN: FQTN,
        usageCapture: UsageCapture,
        qualifiedNameParts: string[],
        callExpressions: CallExpression[],
        typeInfo: TypeInfo,
        importReferences: Import[],
        filePath: string,
        usagesAndCandidates: UsageCandidate[],
    ): string {
        this.addQualifiedNameToCallExpressions(usageCapture, qualifiedNameParts, callExpressions);

        const qualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());

        // Skip current one if invalid space is included in potential class or namespace name
        if (qualifiedName.includes(" ") || qualifiedName.includes("<")) {
            return qualifiedName;
        }

        const usedNamespace = this.buildCandidateForSameNamespace(typeInfo, qualifiedName);

        const parentNamespaceCandidates = this.buildCandidatesForParentNamespace(
            typeInfo,
            qualifiedName,
        );

        const moreCandidates = this.buildMoreCandidates(
            importReferences,
            qualifiedNameParts,
            typeInfo,
            qualifiedName,
        );

        // Also, add candidate with exact used namespace
        // in the case that it is a fully qualified (root) namespace
        const finalCandidates = [
            qualifiedName,
            usedNamespace,
            ...moreCandidates,
            ...parentNamespaceCandidates,
        ];

        for (const candidate of finalCandidates) {
            const usageCandidate: UsageCandidate = {
                usedNamespace: candidate,
                fromNamespace: FQTN,
                sourceOfUsing: filePath,
                usageType: usageCapture.usageType,
            };
            // TODO prevent duplicate adds in current file
            //  when is it a duplicate? (usedNamespace + fromFQTN + sourceOfUsing?)
            usagesAndCandidates.push(usageCandidate);
        }

        return qualifiedName;
    }

    private buildCandidateForSameNamespace(typeInfo: TypeInfo, cleanQualifiedName: string): string {
        // For languages that allow the usage of classes in the same namespace without the need of an import:
        // add candidate in same namespace for unresolvable usage
        return typeInfo.namespace + typeInfo.namespaceDelimiter + cleanQualifiedName;
    }

    private buildCandidatesForParentNamespace(
        typeInfo: TypeInfo,
        cleanQualifiedName: string,
    ): string[] {
        // For languages that allow the usage of classes in parent namespace without the need of an import:
        // Look in parent namespaces for the used class name even if no import is present

        const parentNamespaceCandidates: string[] = [];
        if (typeInfo.namespace.includes(this.getNamespaceDelimiter())) {
            const sourceNamespaceParts = typeInfo.namespace.split(this.getNamespaceDelimiter());
            while (sourceNamespaceParts.length > 1) {
                sourceNamespaceParts.pop();

                const candidate =
                    sourceNamespaceParts.join(this.getNamespaceDelimiter()) +
                    this.getNamespaceDelimiter() +
                    cleanQualifiedName;
                parentNamespaceCandidates.push(candidate);
            }
        }

        return parentNamespaceCandidates;
    }

    private buildMoreCandidates(
        importReferences: Import[],
        qualifiedNameParts: string[],
        typeInfo: TypeInfo,
        cleanQualifiedName: string,
    ): string[] {
        // Heavy candidate building
        // combine current usage with all the imports
        const moreCandidates: string[] = [];
        if (this.indirectNamespaceReferencing()) {
            for (const importReference of importReferences) {
                if (this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()) {
                    const clonedNameParts = [...qualifiedNameParts];
                    while (clonedNameParts.length > 0) {
                        moreCandidates.push(
                            importReference.importReferenceFullName +
                                typeInfo.namespaceDelimiter +
                                clonedNameParts.join(this.getNamespaceDelimiter()),
                        );
                        clonedNameParts.pop();
                    }
                } else {
                    moreCandidates.push(
                        importReference.importReferenceFullName +
                            typeInfo.namespaceDelimiter +
                            cleanQualifiedName,
                    );
                }
            }
        }

        return moreCandidates;
    }

    private addQualifiedNameToCallExpressions(
        usageCapture: UsageCapture,
        qualifiedNameParts: string[],
        callExpressions: CallExpression[],
    ): void {
        if (
            usageCapture.name === "call_expression" &&
            this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
        ) {
            if (qualifiedNameParts.length > 1) {
                // Pop name of called function or similar callables from qualified name
                qualifiedNameParts.pop();
            }

            callExpressions.push(this.buildCallExpression(qualifiedNameParts));
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

    private buildCallExpression(qualifiedNameParts: string[]): CallExpression {
        const qualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());
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
        return qualifiedNameParts.map((namePart) => {
            if (namePart.endsWith("[]") || namePart.endsWith("()")) {
                return namePart.slice(0, Math.max(0, namePart.length - 2));
            }

            if (namePart.endsWith("?")) {
                return namePart.slice(0, Math.max(0, namePart.length - 1));
            }

            return namePart;
        });
    }
}
