import { QueryBuilder } from "../queries/QueryBuilder";
import {Tree} from "tree-sitter";
import { grammars } from "../grammars";
import {ExpressionMetricMapping} from "../app";
import {formatCaptures} from "../helper/Helper";
import {TreeParser} from "../helper/TreeParser";

interface Package {
    namespace: string, class: string, source: string
}

interface Usage {
    usedNamespace: string, alias?: string, source: string
}

const NAMESPACE_DELIMITER = "."

export class CouplingCSharp implements CouplingMetric {
    private namespaceStatementsSuperSet = [`
            (namespace_declaration
                name: (_) @namespace_definition_name
                body: (_ (class_declaration name: (_) @class_name))
            )
    `];
    private namespaceUseStatementsSuperSets = [
        [`
            (using_directive
                (qualified_name) @namespace_use
            )
        `],
        [`
            (object_creation_expression
                type: (_) @object_class_name
            )
            (member_access_expression) @member_access_expression
        `]
    ];
    private treeParser: TreeParser

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;

        allNodeTypes.forEach((expressionMapping) => {
            if (expressionMapping.metrics.includes(this.getName()) && expressionMapping.type === "statement") {
                const { expression } = expressionMapping
                this.namespaceStatementsSuperSet.push("("+expression+") @" + expression)
            }
        })
    }

    calculate(parseFiles: ParseFile[]): CouplingMetricResult {
        let packages: Map<string, Package> = new Map();
        let usages: Usage[] = [];

        for (const parseFile of parseFiles) {
            packages = new Map([...packages, ...this.getPackages(parseFile)])
        }

        for (const parseFile of parseFiles) {
            const tree = this.treeParser.getParseTree(parseFile)

            usages = usages.concat(this.getSimpleUsages(parseFile, tree))
            usages = this.getEnrichedUsageCandidates(packages, usages, parseFile, tree)
        }

        console.log("\n\n")
        console.log("packages", packages, "\n\n")
        console.log("usages", usages)

        const couplingResults = this.getCoupledFilesData(packages, usages)

        console.log("\n\n", couplingResults)

        return {
            metricName: this.getName(),
            metricValue: couplingResults,
        };
    }

    /**
     * TODO scan interface, abstract class, and trait declarations as well (not only classes)
     */
    private getPackages(parseFile: ParseFile) {
        const packages: Map<string, {namespace: string, class: string, source: string}> = new Map();

        const tree = this.treeParser.getParseTree(parseFile)

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceStatementsSuperSet);

        const query = queryBuilder.build();
        const captures = query.captures(tree.rootNode);
        const textCaptures = formatCaptures(tree, captures);

        console.log(textCaptures);

        for (let index = 0; index < textCaptures.length; index+=1) {
            const namespaceName = textCaptures[index].text

            let hasClassDeclaration = textCaptures[index + 1]?.name === "class_name"
            let classDeclarationIndex = index;

            while(hasClassDeclaration) {
                const className = textCaptures[classDeclarationIndex + 1].text
                packages.set(namespaceName + NAMESPACE_DELIMITER + className, {namespace: namespaceName, class: className, source: parseFile.filePath})

                hasClassDeclaration = textCaptures[classDeclarationIndex + 2]?.name === "class_name"
                classDeclarationIndex++
                index++
            }
        }

        return packages
    }

    private getEnrichedUsageCandidates(packages: Map<string, Package>, usages: Usage[], parseFile: ParseFile, tree: Tree) {
        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceUseStatementsSuperSets[1]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);

        const objectCreations = usagesCaptures.filter((capture) => {
            return capture.name === "object_class_name";
        });

        const rawObjectCreations = formatCaptures(tree, objectCreations);
        const objectsCreated = new Set();
        for (const objectCreation of rawObjectCreations) {
            objectsCreated.add(objectCreation.text)
        }

        const memberAccesses = usagesCaptures.filter((capture) => {
            return capture.name === "member_access_expression";
        });

        const rawMemberAccesses = formatCaptures(tree, memberAccesses);

        const accessedClassNames = new Set();
        const regexValidClassNames = new RegExp(/^[A-Z][A-Za-z0-9_]*\.[A-Z][A-Za-z0-9_]*/);
        for (const member of rawMemberAccesses) {
            if (!regexValidClassNames.test(member.text)) {
                continue;
            }
            if (member.text.charAt(0) === member.text.charAt(0).toUpperCase()) {
                const className = member.text.substring(0, member.text.lastIndexOf("."))
                accessedClassNames.add(className)
            }
        }

        //console.log("\n\n")
        //console.log("CREATIONS", objectsCreated)
        //console.log("Accesseds", accessedClassNames)
        //console.log("length of usagse: ", usages.length)
        //console.log("\n\n")

        const usageCandidates: Map<string, Usage> = new Map()

        for (const usage of usages) {
            const originalUsage: Usage = {...usage}
            usageCandidates.set(originalUsage.usedNamespace, originalUsage)

            for (const objectCreation of objectsCreated) {
                const candidate: Usage = {...usage}
                candidate.usedNamespace += NAMESPACE_DELIMITER + objectCreation
                if (packages.has(candidate.usedNamespace)) {
                    usageCandidates.set(candidate.usedNamespace, candidate)
                }
            }
            for (const accessedClassName of accessedClassNames) {
                const candidate: Usage = {...usage}
                candidate.usedNamespace += NAMESPACE_DELIMITER + accessedClassName
                if (packages.has(candidate.usedNamespace)) {
                    usageCandidates.set(candidate.usedNamespace, candidate)
                }
            }
        }
        //console.log("usage candidates: ", usageCandidates)
        //console.log("\n\n")

        return [...usageCandidates.values()]
    }

    private getSimpleUsages(parseFile: ParseFile, tree: Tree) {
        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.namespaceUseStatementsSuperSets[0]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);
        const usagesTextCaptures = formatCaptures(tree, usagesCaptures);

        console.log(usagesTextCaptures);

        const usagesOfFile: {usedNamespace: string, usedSource: string, alias?: string, source: string}[] = [];
        for (let index = 0; index < usagesTextCaptures.length; index++) {
            if (usagesTextCaptures[index].name === "namespace_use_alias") {
                const namespaceAlias = usagesTextCaptures[index].text
                usagesOfFile[index - 1].alias = namespaceAlias

                continue;
            }

            const namespaceName = usagesTextCaptures[index].text
            usagesOfFile.push({usedNamespace: namespaceName, usedSource: parseFile.filePath, alias: "", source: parseFile.filePath})
        }

        return usagesOfFile
    }

    private getCoupledFilesData(packages: Map<string, Package>, usages: Usage[]) {
        return usages.flatMap((usage) => {
            if (packages.has(usage.usedNamespace)) {
                const fromData = [...packages.values()].filter((value) => {
                    if (usage.source === value.source) {
                        return value;
                    }
                });
                if (fromData.length > 0) {
                    const firstFromNamespace = fromData[0]
                    return [{
                        fromNamespace: firstFromNamespace.namespace + NAMESPACE_DELIMITER + firstFromNamespace.class,
                        toNamespace: usage.usedNamespace,
                        fromSource: usage.source,
                        toSource: packages.get(usage.usedNamespace).source
                    }]
                }
            }
            return [];
        })
    }

    getName(): string {
        return "coupling"
    }
}
