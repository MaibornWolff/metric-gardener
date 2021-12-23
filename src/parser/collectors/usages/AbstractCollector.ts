import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { TreeParser } from "../../helper/TreeParser";
import { NamespaceCollector } from "../NamespaceCollector";
import { ParseFile } from "../../metrics/Metric";

export interface ImportReference {
    usedNamespace: string;
    namespaceSuffix: string;
    sourceOfUsing: string;
    alias: string;
    source: string;
    usageType: string | "usage" | "extends" | "implements";
}

export interface UsageCandidate {
    usedNamespace: string;
    fromNamespace: string;
    sourceOfUsing: string;
    usageType: string | "usage" | "extends" | "implements";
}

export abstract class AbstractCollector {
    // In C# for example, it is not possible to know which usage belongs to which import
    // Imagine:
    // using System;
    // Console.WriteLine("foo");
    // You cannot be sure that the Console.WriteLine (partial) namespace belongs to Namespace System
    protected abstract indirectNamespaceReferencing(): boolean;
    protected abstract getFunctionCallDelimiter(): string;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getImportsQuery(): string;
    protected abstract getGroupedImportsQuery(): string;
    protected abstract getUsagesQuery(): string;

    private importsBySuffixOrAlias = new Map<string, Map<string, ImportReference>>();

    getUsageCandidates(
        parseFile: ParseFile,
        namespaceCollector: NamespaceCollector
    ): UsageCandidate[] {
        this.importsBySuffixOrAlias.set(parseFile.filePath, new Map());

        let importReferences: ImportReference[] = this.getImports(parseFile, namespaceCollector);
        if (this.getGroupedImportsQuery().length > 0) {
            importReferences = importReferences.concat(
                this.getGroupedImports(parseFile, namespaceCollector)
            );
        }

        console.log("Alias Map:", parseFile.filePath, this.importsBySuffixOrAlias);
        console.log("Import References", parseFile.filePath, importReferences);

        const usages = this.getUsages(parseFile, namespaceCollector, importReferences);
        console.log("UsagesAndCandidates", parseFile.filePath, usages);

        return usages;
    }

    getImports(parseFile: ParseFile, namespaceCollector: NamespaceCollector): ImportReference[] {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getImportsQuery()]);

        const importsQuery = queryBuilder.build();
        const importsCaptures = importsQuery.captures(tree.rootNode);
        const importsTextCaptures = formatCaptures(tree, importsCaptures);

        console.log(importsTextCaptures);

        const usagesOfFile: ImportReference[] = [];

        let usageAliasPrefix = "";
        for (const importTextCapture of importsTextCaptures) {
            if (importTextCapture.name === "namespace_use_alias_prefix") {
                usageAliasPrefix = importTextCapture.text;
                continue;
            }
            if (importTextCapture.name === "namespace_use_alias_suffix") {
                const matchingUsage = usagesOfFile[usagesOfFile.length - 1];
                matchingUsage.alias = importTextCapture.text;

                this.importsBySuffixOrAlias
                    .get(parseFile.filePath)
                    ?.delete(matchingUsage.namespaceSuffix);
                this.importsBySuffixOrAlias
                    .get(parseFile.filePath)
                    ?.set(importTextCapture.text, matchingUsage);

                continue;
            }

            const usedNamespace = importTextCapture.text;

            const importReference: ImportReference = {
                usedNamespace,
                namespaceSuffix: usedNamespace.split(this.getNamespaceDelimiter()).pop(),
                sourceOfUsing: parseFile.filePath,
                alias: usageAliasPrefix,
                source: parseFile.filePath,
                usageType: "usage",
            };

            usagesOfFile.push(importReference);
            this.importsBySuffixOrAlias
                .get(parseFile.filePath)
                ?.set(
                    usageAliasPrefix.length > 0
                        ? importReference.alias
                        : importReference.namespaceSuffix,
                    importReference
                );

            if (usageAliasPrefix.length > 0) {
                usageAliasPrefix = "";
            }
        }

        return usagesOfFile;
    }

    getGroupedImports(parseFile: ParseFile, namespaceCollector: NamespaceCollector) {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getGroupedImportsQuery()]);

        const groupedImportsQuery = queryBuilder.build();
        const importCaptures = groupedImportsQuery.captures(tree.rootNode);
        const importTextCaptures = formatCaptures(tree, importCaptures);

        console.log(importTextCaptures);

        const importsOfFile: ImportReference[] = [];

        for (let index = 0; index < importTextCaptures.length; index++) {
            if (importTextCaptures[index].name === "namespace_use_alias_suffix") {
                const matchingUsage = importsOfFile[importsOfFile.length - 1];
                // split alias from alias keyword (if any) by space and use last element by pop()
                // it seems to be not possible to query the alias part only
                const alias = importTextCaptures[index].text.split(" ").pop();

                this.importsBySuffixOrAlias
                    .get(parseFile.filePath)
                    ?.delete(matchingUsage.namespaceSuffix);
                if (alias.length > 0) {
                    matchingUsage.alias = alias;
                    this.importsBySuffixOrAlias.get(parseFile.filePath)?.set(alias, matchingUsage);
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

                const namespaceSuffix = usedNamespace.split(this.getNamespaceDelimiter()).pop();
                if (namespaceSuffix !== undefined) {
                    const importReferences: ImportReference = {
                        usedNamespace: usedNamespace,
                        namespaceSuffix,
                        sourceOfUsing: parseFile.filePath,
                        alias: "",
                        source: parseFile.filePath,
                        usageType: "usage",
                    };

                    importsOfFile.push(importReferences);
                    this.importsBySuffixOrAlias
                        .get(parseFile.filePath)
                        ?.set(importReferences.namespaceSuffix, importReferences);
                }

                hasUseGroupItem =
                    importTextCaptures[groupItemIndex + 2]?.name === "namespace_use_item_name";
                groupItemIndex++;
                index++;
            }
        }

        return importsOfFile;
    }

    getUsages(
        parseFile: ParseFile,
        namespaceCollector: NamespaceCollector,
        importReferences: ImportReference[]
    ): UsageCandidate[] {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getUsagesQuery()]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures: {
            name: string;
            text: string;
            usageType?: string;
            source?: string;
        }[] = formatCaptures(tree, usagesCaptures);

        console.log("class/object usages", usagesTextCaptures);

        const usagesAndCandidates: UsageCandidate[] = [];

        // resolve implemented and extended classes
        for (const [fullyQualifiedName, namespaceReference] of namespaceCollector.getNamespaces(
            parseFile
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
            if (namespaceReference?.extendedClass !== undefined) {
                usagesTextCaptures.push({
                    name: "qualified_name",
                    text: namespaceReference.extendedClass,
                    usageType: "extends",
                    source: fullyQualifiedName,
                });
            }
        }

        // resolve usages against import statements and build concrete usages or usage candidates

        const processedQualifiedNames = new Set<string>();
        for (const { name, text: qualifiedName, usageType, source } of usagesTextCaptures) {
            if (
                processedQualifiedNames.has(qualifiedName) ||
                (name !== "qualified_name" && name !== "call_expression")
            ) {
                continue;
            }

            processedQualifiedNames.add(qualifiedName);

            const qualifiedNameParts = qualifiedName.split(this.getNamespaceDelimiter());
            const qualifiedNamePrefix = qualifiedNameParts.shift();
            if (qualifiedNamePrefix === undefined) {
                continue;
            }

            const resolvedImport = this.importsBySuffixOrAlias
                .get(parseFile.filePath)
                ?.get(qualifiedNamePrefix);

            let fromNamespace = namespaceCollector.getNamespaces(parseFile).values().next().value;
            if (!fromNamespace) {
                // no namespace found in current file
                break;
            }

            // Resolve the right entity/class/namespace in a file with multiple ones
            if (source !== undefined) {
                for (const [tempKey, tempValue] of namespaceCollector
                    .getNamespaces(parseFile)
                    .entries()) {
                    if (tempKey === source) {
                        fromNamespace = tempValue;
                    }
                }
            }

            if (resolvedImport !== undefined) {
                if (
                    name === "call_expression" &&
                    this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
                ) {
                    // Pop name of called function or similar callables
                    qualifiedNameParts.pop();
                }
                const usageCandidate: UsageCandidate = {
                    usedNamespace:
                        resolvedImport.usedNamespace +
                        (qualifiedNameParts.length > 0
                            ? this.getNamespaceDelimiter() +
                              qualifiedNameParts.join(this.getNamespaceDelimiter())
                            : ""),
                    fromNamespace:
                        fromNamespace.namespace +
                        fromNamespace.namespaceDelimiter +
                        fromNamespace.className,
                    sourceOfUsing: parseFile.filePath,
                    usageType: usageType !== undefined ? usageType : "usage",
                };
                usagesAndCandidates.push(usageCandidate);
            } else {
                const qualifiedNameParts = qualifiedName.split(this.getNamespaceDelimiter());
                if (
                    name === "call_expression" &&
                    this.getNamespaceDelimiter() === this.getFunctionCallDelimiter()
                ) {
                    // Pop name of called function or similar callables from qualified name
                    qualifiedNameParts.pop();
                }

                const cleanQualifiedName = qualifiedNameParts.join(this.getNamespaceDelimiter());

                // for languages that allow the usage of classes in the same namespace without the need of an import:
                // add candidate in same namespace for unresolvable usage

                let usedNamespace = fromNamespace.namespace;
                if (!cleanQualifiedName.startsWith(fromNamespace.namespaceDelimiter)) {
                    usedNamespace += fromNamespace.namespaceDelimiter;
                }
                usedNamespace += cleanQualifiedName;

                // Heavy candidate building
                // combine current usage with all of the imports
                const moreCandidates: string[] = [];
                if (this.indirectNamespaceReferencing()) {
                    for (const importReference of importReferences) {
                        moreCandidates.push(
                            importReference.usedNamespace +
                                fromNamespace.namespaceDelimiter +
                                cleanQualifiedName
                        );
                    }
                }

                // Also, add candidate with exact used namespace
                // in the case that it is a fully qualified (root) namespace

                for (const candidateUsedNamespace of [usedNamespace, cleanQualifiedName].concat(
                    moreCandidates
                )) {
                    const usageCandidate: UsageCandidate = {
                        usedNamespace: candidateUsedNamespace,
                        fromNamespace:
                            fromNamespace.namespace +
                            fromNamespace.namespaceDelimiter +
                            fromNamespace.className,
                        sourceOfUsing: parseFile.filePath,
                        usageType: usageType !== undefined ? usageType : "usage",
                    };
                    // TODO prevent duplicate adds in current file
                    //  when is it a duplicate? (usedNamespace + fromNamespace + sourceOfUsing?)
                    usagesAndCandidates.push(usageCandidate);
                }
            }
        }

        return usagesAndCandidates;
    }
}
