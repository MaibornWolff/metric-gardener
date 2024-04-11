import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture } from "tree-sitter";
import { QueryBuilder } from "../../queries/QueryBuilder.js";
import { formatCaptures } from "../../helper/Helper.js";
import { type NamespaceCollector } from "../NamespaceCollector.js";
import { type ParsedFile, type UsageType } from "../../metrics/Metric.js";
import { SimpleQueryStatement } from "../../queries/QueryStatements.js";
import { type FullyQTN } from "../fullyQualifiedTypeNames/AbstractCollector.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export type ImportReference = {
    usedNamespace: string;
    namespaceSuffix: string;
    sourceOfUsing: string;
    alias: string;
    source: string;
    usageType: UsageType;
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
    protected abstract getImportsQuery(): string;
    protected abstract getGroupedImportsQuery(): string;
    protected abstract getUsagesQuery(): string;

    private readonly importsBySuffixOrAlias = new Map<string, Map<string, ImportReference>>();

    getUsageCandidates(
        parsedFile: ParsedFile,
        namespaceCollector: NamespaceCollector,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const { filePath } = parsedFile;
        this.importsBySuffixOrAlias.set(filePath, new Map());

        let importReferences: ImportReference[] = this.getImports(parsedFile);
        if (this.getGroupedImportsQuery().length > 0) {
            importReferences = importReferences.concat(this.getGroupedImports(parsedFile));
        }

        dlog("Alias Map:", filePath, this.importsBySuffixOrAlias);
        dlog("Import References", filePath, importReferences);

        const { candidates, unresolvedCallExpressions } = this.getUsages(
            parsedFile,
            namespaceCollector,
            importReferences,
        );
        dlog("UsagesAndCandidates", filePath, candidates);

        return {
            candidates,
            unresolvedCallExpressions,
        };
    }

    private getImports(parsedFile: ParsedFile): ImportReference[] {
        const { filePath, language, tree } = parsedFile;

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([new SimpleQueryStatement(this.getImportsQuery())]);

        const importsQuery = queryBuilder.build();
        let importsCaptures: QueryCapture[] = [];
        if (importsQuery !== undefined) {
            importsCaptures = importsQuery.captures(tree.rootNode);
        }

        const importsTextCaptures = formatCaptures(tree, importsCaptures);

        dlog(importsTextCaptures.toString());

        const importsOfFile: ImportReference[] = [];

        let usageAliasPrefix = "";
        for (const importTextCapture of importsTextCaptures) {
            if (importTextCapture.name === "namespace_use_alias_prefix") {
                usageAliasPrefix = importTextCapture.text;
                continue;
            }

            if (importTextCapture.name === "namespace_use_alias_suffix") {
                const matchingUsage = importsOfFile.at(-1);
                matchingUsage.alias = importTextCapture.text;

                this.importsBySuffixOrAlias.get(filePath)?.delete(matchingUsage.namespaceSuffix);
                this.importsBySuffixOrAlias
                    .get(filePath)
                    ?.set(importTextCapture.text, matchingUsage);

                continue;
            }

            const usedNamespace = importTextCapture.text;

            const importReference: ImportReference = {
                usedNamespace,
                namespaceSuffix: usedNamespace.split(this.getNamespaceDelimiter()).pop() ?? "",
                sourceOfUsing: filePath,
                alias: usageAliasPrefix,
                source: filePath,
                usageType: "usage",
            };

            importsOfFile.push(importReference);
            this.importsBySuffixOrAlias
                .get(filePath)
                ?.set(
                    usageAliasPrefix.length > 0
                        ? importReference.alias
                        : importReference.namespaceSuffix,
                    importReference,
                );

            if (usageAliasPrefix.length > 0) {
                usageAliasPrefix = "";
            }
        }

        return importsOfFile;
    }

    private getGroupedImports(parsedFile: ParsedFile): ImportReference[] {
        const { filePath, language, tree } = parsedFile;

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([new SimpleQueryStatement(this.getGroupedImportsQuery())]);

        const groupedImportsQuery = queryBuilder.build();
        let importCaptures: QueryCapture[] = [];
        if (groupedImportsQuery !== undefined) {
            importCaptures = groupedImportsQuery.captures(tree.rootNode);
        }

        const importTextCaptures = formatCaptures(tree, importCaptures);

        dlog(importTextCaptures.toString());

        const importsOfFile: ImportReference[] = [];

        for (let index = 0; index < importTextCaptures.length; index++) {
            if (importTextCaptures[index].name === "namespace_use_alias_suffix") {
                const matchingUsage = importsOfFile.at(-1);
                // Split alias from alias keyword (if any) by space and use last element by pop()
                // it seems to be not possible to query the alias part only
                const alias = importTextCaptures[index].text.split(" ").pop() ?? "";

                this.importsBySuffixOrAlias.get(filePath)?.delete(matchingUsage.namespaceSuffix);
                if (alias.length > 0) {
                    matchingUsage.alias = alias;
                    this.importsBySuffixOrAlias.get(filePath)?.set(alias, matchingUsage);
                }

                continue;
            }

            const namespaceName = importTextCaptures[index].text;

            let hasUseGroupItem = importTextCaptures[index + 1]?.name === "namespace_use_item_name";
            let groupItemIndex = index;

            while (hasUseGroupItem) {
                const nextUseItem = importTextCaptures[groupItemIndex + 1];

                const usedNamespace =
                    namespaceName + this.getNamespaceDelimiter() + nextUseItem.text;

                const namespaceSuffix = nextUseItem.text;
                const importReferences: ImportReference = {
                    usedNamespace,
                    namespaceSuffix,
                    sourceOfUsing: filePath,
                    alias: "",
                    source: filePath,
                    usageType: "usage",
                };

                importsOfFile.push(importReferences);
                this.importsBySuffixOrAlias
                    .get(filePath)
                    ?.set(importReferences.namespaceSuffix, importReferences);

                hasUseGroupItem =
                    importTextCaptures[groupItemIndex + 2]?.name === "namespace_use_item_name";
                groupItemIndex++;
                index++;
            }
        }

        return importsOfFile;
    }

    private getUsages(
        parsedFile: ParsedFile,
        namespaceCollector: NamespaceCollector,
        importReferences: ImportReference[],
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const { filePath, language, tree } = parsedFile;

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([new SimpleQueryStatement(this.getUsagesQuery())]);

        const usagesQuery = queryBuilder.build();
        let usagesCaptures: QueryCapture[] = [];
        if (usagesQuery !== undefined) {
            usagesCaptures = usagesQuery.captures(tree.rootNode);
        }

        const usagesTextCaptures: Array<{
            name: string;
            text: string;
            usageType?: UsageType;
            source?: string;
        }> = formatCaptures(tree, usagesCaptures);

        dlog("class/object usages", usagesTextCaptures);

        const usagesAndCandidates: TypeUsageCandidate[] = [];
        const unresolvedCallExpressions: UnresolvedCallExpression[] = [];

        // Add implemented and extended classes as usages
        // to consider the coupling of those
        for (const [fullyQualifiedName, namespaceReference] of namespaceCollector.getNamespaces(
            parsedFile,
        )) {
            if (namespaceReference.implementedClasses.length > 0) {
                for (const implementedClass of namespaceReference.implementedClasses) {
                    usagesTextCaptures.push({
                        name: "qualified_name",
                        text: implementedClass,
                        usageType: "implements",
                        source: fullyQualifiedName,
                    });
                }
            }

            if (namespaceReference.extendedClass !== undefined) {
                usagesTextCaptures.push({
                    name: "qualified_name",
                    text: namespaceReference.extendedClass,
                    usageType: "extends",
                    source: fullyQualifiedName,
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
                if (namePart.endsWith("[]")) {
                    return namePart.slice(0, Math.max(0, namePart.length - 2));
                }

                if (namePart.endsWith("?")) {
                    return namePart.slice(0, Math.max(0, namePart.length - 1));
                }

                if (namePart.endsWith("()")) {
                    return namePart.slice(0, Math.max(0, namePart.length - 2));
                }

                return namePart;
            });

            qualifiedName = cleanNameParts.join(this.getNamespaceDelimiter());

            const qualifiedNamePrefix = cleanNameParts.shift();
            if (qualifiedNamePrefix === undefined) {
                continue;
            }

            const resolvedImport = this.importsBySuffixOrAlias
                .get(filePath)
                ?.get(qualifiedNamePrefix);

            const namespaces = namespaceCollector.getNamespaces(parsedFile).values();
            let fromNamespace = namespaces.next().value as FullyQTN | undefined;
            if (!fromNamespace) {
                // No namespace found in current file
                break;
            }

            // Resolve the right entity/class/namespace in a file with multiple ones
            if (source !== undefined) {
                for (const [temporaryKey, temporaryValue] of namespaceCollector
                    .getNamespaces(parsedFile)
                    .entries()) {
                    if (temporaryKey === source) {
                        fromNamespace = temporaryValue;
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

                let usedNamespace = fromNamespace.namespace;
                if (!cleanQualifiedName.startsWith(fromNamespace.namespaceDelimiter)) {
                    usedNamespace += fromNamespace.namespaceDelimiter;
                }

                usedNamespace += cleanQualifiedName;

                // For languages that allow the usage of classes in parent namespace without the need of an import:
                // Look in parent namespaces for the used class name even if no import is present

                const parentNamespaceCandidates: string[] = [];
                if (fromNamespace.namespace.includes(this.getNamespaceDelimiter())) {
                    const sourceNamespaceParts = fromNamespace.namespace.split(
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
                                    importReference.usedNamespace +
                                        fromNamespace.namespaceDelimiter +
                                        clonedNameParts.join(this.getNamespaceDelimiter()),
                                );
                                clonedNameParts.pop();
                            }
                        } else {
                            moreCandidates.push(
                                importReference.usedNamespace +
                                    fromNamespace.namespaceDelimiter +
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
                            fromNamespace.namespace +
                            fromNamespace.namespaceDelimiter +
                            fromNamespace.className,
                        sourceOfUsing: filePath,
                        usageType: usageType === undefined ? "usage" : usageType,
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
                        resolvedImport.usedNamespace +
                        (cleanNameParts.length > 0
                            ? this.getNamespaceDelimiter() + modifiedQualifiedName
                            : ""),
                    fromNamespace:
                        fromNamespace.namespace +
                        fromNamespace.namespaceDelimiter +
                        fromNamespace.className,
                    sourceOfUsing: filePath,
                    usageType: usageType === undefined ? "usage" : usageType,
                };
                usagesAndCandidates.push(usageCandidate);

                if (
                    resolvedImport.alias !== "" &&
                    this.noImportForClassesInSameOrParentNamespaces()
                ) {
                    // In This case, alias can be a Qualified Name
                    // Add Same Namespace Candidate
                    // Add Parent Namespace Candidate
                    const fromNamespaceParts = fromNamespace.namespace.split(
                        this.getNamespaceDelimiter(),
                    );
                    while (fromNamespaceParts.length > 0) {
                        const usageCandidate: TypeUsageCandidate = {
                            usedNamespace:
                                fromNamespaceParts.join(this.getNamespaceDelimiter()) +
                                fromNamespace.namespaceDelimiter +
                                resolvedImport.usedNamespace,
                            fromNamespace:
                                fromNamespace.namespace +
                                fromNamespace.namespaceDelimiter +
                                fromNamespace.className,
                            sourceOfUsing: filePath,
                            usageType: usageType === undefined ? "usage" : usageType,
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
