/*
import { TreeParser } from "../../helper/TreeParser";
import { AbstractCollector, UsageReference } from "./AbstractCollector";
import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { NamespaceReference } from "../namespaces/AbstractCollector";

const NAMESPACE_DELIMITER = ".";

export class CSharpCollector extends AbstractCollector {
    private memberAccessesQuery = `
        (object_creation_expression
            type: (_) @object_class_name
        )
        (member_access_expression) @member_access_expression
    `;

    protected getUsagesQuery(): string {
        return `
            (using_directive
                (qualified_name) @namespace_use
            )
        `;
    }

    getUsages(parseFile: ParseFile, namespaceCollector): UsageReference[] {
        const usages: UsageReference[] = super.getUsages(parseFile, namespaceCollector);
        return this.getEnrichedUsageCandidates(
            namespaceCollector.getAllNamespaces(),
            usages,
            parseFile
        );
    }

    private getEnrichedUsageCandidates(
        namespaces: Map<string, NamespaceReference>,
        usages: UsageReference[],
        parseFile: ParseFile
    ) {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.memberAccessesQuery]);

        const usagesQuery = queryBuilder.build();
        const usagesCaptures = usagesQuery.captures(tree.rootNode);

        const objectCreations = usagesCaptures.filter((capture) => {
            return capture.name === "object_class_name";
        });

        const rawObjectCreations = formatCaptures(tree, objectCreations);
        const objectsCreated = new Set();
        for (const objectCreation of rawObjectCreations) {
            objectsCreated.add(objectCreation.text);
        }

        const memberAccesses = usagesCaptures.filter((capture) => {
            return capture.name === "member_access_expression";
        });

        const rawMemberAccesses = formatCaptures(tree, memberAccesses);

        const accessedClassNames = new Set();
        const regexValidClassNames = new RegExp(/^[A-Z][A-Za-z0-9_]*\.[A-Z][A-Za-z0-9_]*/
/*
);

        for (const member of rawMemberAccesses) {
            if (!regexValidClassNames.test(member.text)) {
                continue;
            }
            if (member.text.charAt(0) === member.text.charAt(0).toUpperCase()) {
                const className = member.text.substring(0, member.text.lastIndexOf("."));
                accessedClassNames.add(className);
            }
        }

        const usageCandidates: Map<string, UsageReference> = new Map();

        for (const usage of usages) {
            const originalUsage: UsageReference = { ...usage };
            usageCandidates.set(originalUsage.usedNamespace, originalUsage);

            for (const objectCreation of objectsCreated) {
                const candidate: UsageReference = { ...usage };
                candidate.usedNamespace += NAMESPACE_DELIMITER + objectCreation;
                if (namespaces.has(candidate.usedNamespace)) {
                    usageCandidates.set(candidate.usedNamespace, candidate);
                }
            }
            for (const accessedClassName of accessedClassNames) {
                const candidate: UsageReference = { ...usage };
                candidate.usedNamespace += NAMESPACE_DELIMITER + accessedClassName;
                if (namespaces.has(candidate.usedNamespace)) {
                    usageCandidates.set(candidate.usedNamespace, candidate);
                }
            }
        }
        //console.log("usage candidates: ", usageCandidates)
        //console.log("\n\n")

        return [...usageCandidates.values()];
    }
}
*/
