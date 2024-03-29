import { QueryBuilder } from "../queries/QueryBuilder.js";
import { NodeTypeConfig, NodeTypeCategory } from "../helper/Model.js";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import {
    NodeTypeQueryStatement,
    OperatorQueryStatement,
    QueryStatementInterface,
    SimpleLanguageSpecificQueryStatement,
    SimpleQueryStatement,
} from "../queries/QueryStatements.js";
import { Language } from "../helper/Language.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Complexity implements Metric {
    private complexityStatementsSuperSet: QueryStatementInterface[] = [];

    private nodeTypeCategories = new Set([
        NodeTypeCategory.If,
        NodeTypeCategory.Loop,
        NodeTypeCategory.ConditionalExpression,
        NodeTypeCategory.LogicalBinaryExpression,
        NodeTypeCategory.CaseLabel,
        NodeTypeCategory.CatchBlock,
        NodeTypeCategory.Function,
    ]);

    constructor(allNodeTypes: NodeTypeConfig[]) {
        const languagesWithDefaultLabelAbbr = new Set<string>();
        const caseNodeTypes: NodeTypeConfig[] = [];

        for (const nodeType of allNodeTypes) {
            /*
             * Determine for which languages there is an explicit default label node type in the grammar.
             * Handle case label node types differently based upon this.
             */
            if (nodeType.category === NodeTypeCategory.DefaultLabel) {
                for (const language of nodeType.languages) {
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
    }

    addBinaryExpressionQueryStatement(nodeType: NodeTypeConfig) {
        if (nodeType.operator !== undefined) {
            this.complexityStatementsSuperSet.push(new OperatorQueryStatement(nodeType));
        }
    }

    addExpressionQueryStatement(nodeType: NodeTypeConfig) {
        this.complexityStatementsSuperSet.push(new NodeTypeQueryStatement(nodeType));
    }

    /**
     * Add queries for each case label syntax node type.
     */
    addCaseLabelQueryStatements(
        caseNodeTypes: NodeTypeConfig[],
        languagesWithDefaultLabelAbbr: Set<string>,
    ) {
        for (const caseNodeType of caseNodeTypes) {
            const haveDefaultNodeType: string[] = [];
            const haveNoDefaultNodeType: string[] = [];

            for (const languageAbbr of caseNodeType.languages) {
                if (languagesWithDefaultLabelAbbr.has(languageAbbr)) {
                    haveDefaultNodeType.push(languageAbbr);
                } else {
                    haveNoDefaultNodeType.push(languageAbbr);
                }
            }

            // For languages which have also a default node type, always count this case node type:
            if (haveDefaultNodeType.length > 0) {
                this.complexityStatementsSuperSet.push(
                    new NodeTypeQueryStatement(caseNodeType, haveDefaultNodeType),
                );
            }

            // Special query for languages which have no explicit default node type:
            if (haveNoDefaultNodeType.length > 0) {
                this.addCaseDefaultDifferentiatingQuery(haveNoDefaultNodeType, caseNodeType);
            }
        }
    }

    /**
     * Adds a query statement that differentiates if the syntax node type is used as case or default label.
     * For node types which are used for both case labels and default labels.
     * @param noDefaultLangAbbrs Abbreviations of the languages which use the node type as case label and
     * have no explicit default label.
     * @param caseDefaultNodeType The syntax node type.
     */
    addCaseDefaultDifferentiatingQuery(
        noDefaultLangAbbrs: string[],
        caseDefaultNodeType: NodeTypeConfig,
    ) {
        if (caseDefaultNodeType.type_name == "case_statement") {
            // Special treatment for "case_statement" used by at least C++ and PHP.
            // This syntax node can have more than one child,
            // because it also has the content of the case block as child(s).
            //
            // In this case, a case label can be differentiated from a default label by
            // checking if there is a child with the field name "value":
            this.complexityStatementsSuperSet.push(
                new SimpleLanguageSpecificQueryStatement(
                    "(case_statement value: _ ) @case_statement",
                    noDefaultLangAbbrs,
                    caseDefaultNodeType.deactivated_for_languages,
                ),
            );
        } else if (caseDefaultNodeType.type_name == "when_entry") {
            // Special treatment for the "when_entry" used by Kotlin. Can also have more than one child.
            //
            // A conditional when_entry can be differentiated from an else when_entry by checking
            // if the first child ist a "when_condition":
            this.complexityStatementsSuperSet.push(
                new SimpleLanguageSpecificQueryStatement(
                    "(when_entry (when_condition)) @when_entry",
                    noDefaultLangAbbrs,
                    caseDefaultNodeType.deactivated_for_languages,
                ),
            );
        } else if (caseDefaultNodeType.type_name == "match_arm") {
            // Special treatment for the "match_arm" used by Rust.
            //
            // A conditional match_arm can be differentiated from a default label by checking
            // if the match_pattern child node has a child
            this.complexityStatementsSuperSet.push(
                new SimpleLanguageSpecificQueryStatement(
                    "(match_arm pattern: (match_pattern (_))) @match_arm",
                    noDefaultLangAbbrs,
                    caseDefaultNodeType.deactivated_for_languages,
                ),
            );
        } else {
            // Standard treatment: check if the case label node has a named child:
            this.complexityStatementsSuperSet.push(
                new SimpleLanguageSpecificQueryStatement(
                    "(" + caseDefaultNodeType.type_name + " (_)) @" + caseDefaultNodeType.type_name,
                    noDefaultLangAbbrs,
                    caseDefaultNodeType.deactivated_for_languages,
                ),
            );
        }
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);

        if (language === Language.Java) {
            //add query for instance init block in Java
            queryBuilder.setStatements(
                this.complexityStatementsSuperSet.concat(
                    new SimpleQueryStatement("(class_body (block)) @initBlock"),
                ),
            );
        } else {
            queryBuilder.setStatements(this.complexityStatementsSuperSet);
        }

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return FileMetric.complexity;
    }
}
