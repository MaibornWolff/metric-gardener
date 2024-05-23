import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryMatch } from "tree-sitter";
import { type NodeTypeConfig, NodeTypeCategory } from "../../helper/model.js";
import { QueryBuilder } from "../queries/query-builder.js";
import {
    NodeTypeQueryStatement,
    OperatorQueryStatement,
    type QueryStatement,
    SimpleLanguageSpecificQueryStatement,
    SimpleQueryStatement,
} from "../queries/query-statements.js";
import { Language } from "../../helper/language.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Complexity implements Metric {
    private readonly complexityStatementsSuperSet: QueryStatement[] = [];

    private readonly nodeTypeCategories = new Set([
        NodeTypeCategory.If,
        NodeTypeCategory.Loop,
        NodeTypeCategory.ConditionalExpression,
        NodeTypeCategory.LogicalBinaryExpression,
        NodeTypeCategory.CaseLabel,
        NodeTypeCategory.CatchBlock,
        NodeTypeCategory.Function,
    ]);

    constructor(allNodeTypes: NodeTypeConfig[]) {
        const languagesWithDefaultLabelAbbr = new Set<Language>();
        const caseNodeTypes: NodeTypeConfig[] = [];

        for (const nodeType of allNodeTypes) {
            /*
             * Determine for which languages there is an explicit default label node type in the grammar.
             * Handle case label node types differently based upon this.
             */
            if (nodeType.category === NodeTypeCategory.DefaultLabel) {
                for (const language of nodeType.languages) {
                    if (language === undefined) {
                        const languageString: string = language;
                        throw new Error(
                            "Could not find language for language abbreviation" +
                                languageString +
                                ".",
                        );
                    }

                    languagesWithDefaultLabelAbbr.add(language);
                }
            }

            if (this.nodeTypeCategories.has(nodeType.category)) {
                if (nodeType.category === NodeTypeCategory.CaseLabel) {
                    caseNodeTypes.push(nodeType);
                } else if (
                    nodeType.category === NodeTypeCategory.LogicalBinaryExpression &&
                    nodeType.operator !== undefined
                ) {
                    this.addBinaryExpressionQueryStatement(nodeType);
                } else {
                    this.addExpressionQueryStatement(nodeType);
                }
            }
        }

        this.addCaseLabelQueryStatements(caseNodeTypes, languagesWithDefaultLabelAbbr);
        this.addQueriesForCSharp();
    }

    addBinaryExpressionQueryStatement(nodeType: NodeTypeConfig): void {
        if (nodeType.operator !== undefined) {
            this.complexityStatementsSuperSet.push(new OperatorQueryStatement(nodeType));
        }
    }

    addExpressionQueryStatement(nodeType: NodeTypeConfig): void {
        this.complexityStatementsSuperSet.push(new NodeTypeQueryStatement(nodeType));
    }

    /**
     * Add queries for each case label syntax node type.
     */
    addCaseLabelQueryStatements(
        caseNodeTypes: NodeTypeConfig[],
        languagesWithDefaultLabelAbbr: Set<Language>,
    ): void {
        for (const caseNodeType of caseNodeTypes) {
            const haveDefaultNodeType = new Set<Language>();
            const haveNoDefaultNodeType = new Set<Language>();

            for (const language of caseNodeType.languages) {
                if (language === undefined) {
                    const languageString: string = language;
                    throw new Error(
                        "Could not find language for language abbreviation" + languageString + ".",
                    );
                }

                if (languagesWithDefaultLabelAbbr.has(language)) {
                    haveDefaultNodeType.add(language);
                } else {
                    haveNoDefaultNodeType.add(language);
                }
            }

            // For languages which have also a default node type, always count this case node type:
            if (haveDefaultNodeType.size > 0) {
                this.complexityStatementsSuperSet.push(
                    new NodeTypeQueryStatement(caseNodeType, haveDefaultNodeType),
                );
            }

            // Special query for languages which have no explicit default node type:
            if (haveNoDefaultNodeType.size > 0) {
                this.addCaseDefaultDifferentiatingQuery(haveNoDefaultNodeType, caseNodeType);
            }
        }
    }

    /**
     * Adds a query statement that differentiates if the syntax node type is used as case or default label.
     * For node types which are used for both case labels and default labels.
     * @param noDefaultLanguage Abbreviations of the languages which use the node type as case label and
     * have no explicit default label.
     * @param caseDefaultNodeType The syntax node type.
     */
    addCaseDefaultDifferentiatingQuery(
        noDefaultLanguage: Set<Language>,
        caseDefaultNodeType: NodeTypeConfig,
    ): void {
        switch (caseDefaultNodeType.type_name) {
            case "case_statement": {
                // Special treatment for "case_statement" used by at least C++ and PHP.
                // This syntax node can have more than one child,
                // because it also has the content of the case block as child(s).
                //
                // In this case, a case label can be differentiated from a default label by
                // checking if there is a child with the field name "value":
                this.complexityStatementsSuperSet.push(
                    new SimpleLanguageSpecificQueryStatement(
                        "(case_statement value: _ ) @case_statement",
                        noDefaultLanguage,
                        new Set(caseDefaultNodeType.deactivated_for_languages),
                    ),
                );
                break;
            }

            case "when_entry": {
                // Special treatment for the "when_entry" used by Kotlin. Can also have more than one child.
                //
                // A conditional when_entry can be differentiated from an else when_entry by checking
                // if the first child ist a "when_condition":
                this.complexityStatementsSuperSet.push(
                    new SimpleLanguageSpecificQueryStatement(
                        "(when_entry (when_condition)) @when_entry",
                        noDefaultLanguage,
                        new Set(caseDefaultNodeType.deactivated_for_languages),
                    ),
                );
                break;
            }

            case "match_arm": {
                // Special treatment for the "match_arm" used by Rust.
                //
                // A conditional match_arm can be differentiated from a default label by checking
                // if the match_pattern child node has a child
                this.complexityStatementsSuperSet.push(
                    new SimpleLanguageSpecificQueryStatement(
                        "(match_arm pattern: (match_pattern (_))) @match_arm",
                        noDefaultLanguage,
                        new Set(caseDefaultNodeType.deactivated_for_languages),
                    ),
                );
                break;
            }

            default: {
                // Standard treatment: check if the case label node has a named child:
                this.complexityStatementsSuperSet.push(
                    new SimpleLanguageSpecificQueryStatement(
                        "(" +
                            caseDefaultNodeType.type_name +
                            " (_)) @" +
                            caseDefaultNodeType.type_name,
                        noDefaultLanguage,
                        new Set(caseDefaultNodeType.deactivated_for_languages),
                    ),
                );
            }
        }
    }

    addQueriesForCSharp(): void {
        this.complexityStatementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                `(assignment_operator "??=")`,
                new Set([Language.CSharp]),
            ),
            new SimpleLanguageSpecificQueryStatement(
                `(switch_expression_arm . (_) @default (#not-eq? @default "_"))`,
                new Set([Language.CSharp]),
            ),
        );
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);

        if (language === Language.Java) {
            // Add query for instance init block in Java
            queryBuilder.setStatements([
                ...this.complexityStatementsSuperSet,
                new SimpleQueryStatement("(class_body (block)) @initBlock"),
            ]);
        } else {
            queryBuilder.setStatements(this.complexityStatementsSuperSet);
        }

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length.toString());

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): MetricName {
        return "complexity";
    }
}
