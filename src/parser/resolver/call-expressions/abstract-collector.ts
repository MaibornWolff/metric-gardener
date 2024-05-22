import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture, type QueryMatch } from "tree-sitter";
import { QueryBuilder } from "../../queries/query-builder.js";
import { getNameAndTextFromCaptures } from "../../../helper/helper.js";
import { type TypeCollector } from "../type-collector.js";
import { type ParsedFile, type UsageType } from "../../metrics/metric.js";
import { type QueryStatement, SimpleQueryStatement } from "../../queries/query-statements.js";
import { type TypeInfo } from "../types/abstract-collector.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export type ImportReference = {
    referenceName: string;
    referenceSuffix: string;
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

export type ImportCapture = {
    name: string;
    text: string;
};
type ImportMatch = {
    importCaptures: ImportCapture[];
};

export abstract class AbstractCollector {
    private readonly fileToImportsBySuffixOrAliasMap = new Map<
        string,
        Map<string, ImportReference>
    >();

    getUsageCandidates(
        parsedFile: ParsedFile,
        typesFromFile: Map<string, TypeInfo>,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const { filePath } = parsedFile;
        this.fileToImportsBySuffixOrAliasMap.set(filePath, new Map());

        const importReferences = this.getImports(parsedFile);
        if (this.getGroupedImportsQuery().length > 0) {
            importReferences.push(...this.getGroupedImports(parsedFile));
        }

        dlog("Alias Map:", filePath, this.fileToImportsBySuffixOrAliasMap);
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
    protected abstract getImportsQuery(): QueryStatement;
    protected abstract getGroupedImportsQuery(): string;
    protected abstract getUsagesQuery(): string;

    private getImports(parsedFile: ParsedFile): ImportReference[] {
        const { filePath, language, tree } = parsedFile;

        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements([this.getImportsQuery()]);

        const importsQuery = queryBuilder.build();
        let queryMatches: QueryMatch[] = [];
        if (importsQuery !== undefined) {
            queryMatches = importsQuery.matches(tree.rootNode);
        }

        const importMatches = queryMatches.map((queryMatch): ImportMatch => {
            return {
                importCaptures: getNameAndTextFromCaptures(queryMatch.captures),
            };
        });

        dlog(importMatches.toString());

        return this.buildImportReferences(importMatches, filePath);
    }

    private buildImportReferences(
        importMatches: ImportMatch[],
        filePath: string,
    ): ImportReference[] {
        const importsInFile: ImportReference[] = [];

        for (const importMatch of importMatches) {
            const importReference = this.importMatchToImportReference(importMatch, filePath);
            this.fileToImportsBySuffixOrAliasMap
                .get(filePath)
                ?.set(
                    importReference.alias.length > 0
                        ? importReference.alias
                        : importReference.referenceSuffix,
                    importReference,
                );
            importsInFile.push(importReference);
        }

        return importsInFile;
    }

    private importMatchToImportReference(
        importMatch: ImportMatch,
        filePath: string,
    ): ImportReference {
        const { importCaptures } = importMatch;

        let importSpecifierCapture;
        let alias = "";
        for (const capture of importCaptures) {
            if (capture.name === "alias") {
                alias = capture.text;
            } else if (capture.name === "import_specifier") {
                importSpecifierCapture = capture;
            }
        }

        return {
            referenceName: importSpecifierCapture.text,
            referenceSuffix:
                importSpecifierCapture.text.split(this.getNamespaceDelimiter()).pop() ?? "",
            sourceOfUsing: filePath,
            alias,
            source: filePath,
            usageType: "usage",
        };
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

        const importTextCaptures = getNameAndTextFromCaptures(importCaptures);

        dlog(importTextCaptures.toString());

        const importsOfFile: ImportReference[] = [];

        for (let index = 0; index < importTextCaptures.length; index++) {
            if (importTextCaptures[index].name === "namespace_use_alias_suffix") {
                // Todo: rewrite using at() method
                const matchingUsage = importsOfFile[importsOfFile.length - 1]; // eslint-disable-line unicorn/prefer-at
                // Split alias from alias keyword (if any) by space and use last element by pop()
                // it seems to be not possible to query the alias part only
                const alias = importTextCaptures[index].text.split(" ").pop() ?? "";

                this.fileToImportsBySuffixOrAliasMap
                    .get(filePath)
                    ?.delete(matchingUsage.referenceSuffix);
                if (alias.length > 0) {
                    matchingUsage.alias = alias;
                    this.fileToImportsBySuffixOrAliasMap.get(filePath)?.set(alias, matchingUsage);
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
                    referenceName: usedNamespace,
                    referenceSuffix: namespaceSuffix,
                    sourceOfUsing: filePath,
                    alias: "",
                    source: filePath,
                    usageType: "usage",
                };

                importsOfFile.push(importReferences);
                this.fileToImportsBySuffixOrAliasMap
                    .get(filePath)
                    ?.set(importReferences.referenceSuffix, importReferences);

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
        typesFromFile: Map<string, TypeInfo>,
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

            const resolvedImport = this.fileToImportsBySuffixOrAliasMap
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
                                    importReference.referenceName +
                                        fromFQTN.namespaceDelimiter +
                                        clonedNameParts.join(this.getNamespaceDelimiter()),
                                );
                                clonedNameParts.pop();
                            }
                        } else {
                            moreCandidates.push(
                                importReference.referenceName +
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
                        resolvedImport.referenceName +
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
                                resolvedImport.referenceName,
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
