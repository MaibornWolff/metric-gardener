import { QueryBuilder } from "../queries/QueryBuilder";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    NodeTypeCategory,
    OperatorQueryStatement,
    QueryStatementInterface,
    SimpleQueryStatement,
    SimpleLanguageSpecificQueryStatement
} from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import Parser, { QueryMatch } from "tree-sitter";
import { Languages } from "../helper/Languages";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Complexity implements Metric {
    private complexityStatementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        for (const expressionMapping of allNodeTypes) {
            if (expressionMapping.metrics.includes(this.getName())) {
                if (expressionMapping.type === "statement") {
                    const { expression, category, operator, activated_for_languages, languages } =
                        expressionMapping;

                    if (category === NodeTypeCategory.BinaryExpression && operator !== undefined) {
                        this.complexityStatementsSuperSet.push(
                            new OperatorQueryStatement(
                                category,
                                operator,
                                languages,
                                activated_for_languages
                            )
                        );
                    } else if (category === NodeTypeCategory.Other) {
                        this.complexityStatementsSuperSet.push(
                            new ExpressionQueryStatement(
                                expression,
                                languages,
                                activated_for_languages
                            )
                        );
                    }
                }
            }
        }
        this.createCaseQueryStatements(allNodeTypes);
    }

    createCaseQueryStatements(allNodeTypes: ExpressionMetricMapping[]) {
        /*
         * Determine for which languages there is an explicit default label node type in the grammar.
         * Handle case label node types differently based upon this.
         */
        const withDefaultLabelNodeType = new Set<string>();
        const caseNodeTypes = new Set<ExpressionMetricMapping>();

        for (const nodeType of allNodeTypes) {

            if (nodeType.category === NodeTypeCategory.CaseLabel && nodeType.metrics.includes(this.getName())) {
                caseNodeTypes.add(nodeType);
            } else if (nodeType.category === NodeTypeCategory.DefaultLabel) {
                for (const language of nodeType.languages) {
                    withDefaultLabelNodeType.add(language);
                }
            }
        }

        console.log("Language grammars with explicit default label node type: ");
        for (const langAbbr of withDefaultLabelNodeType) {
            console.log(langAbbr);
        }

        for (const caseNodeType of caseNodeTypes) {
            const haveDefaultNodeType: string[] = [];
            const haveNoDefaultNodeType: string[] = [];

            for (const languageAbbr of caseNodeType.languages) {
                if (withDefaultLabelNodeType.has(languageAbbr)) {
                    haveDefaultNodeType.push(languageAbbr);
                } else {
                    haveNoDefaultNodeType.push(languageAbbr);
                }
            }

            // For languages which have also a default node type, always count this case node type:
            if (haveDefaultNodeType.length > 0) {
                this.complexityStatementsSuperSet.push(
                    new ExpressionQueryStatement(
                        caseNodeType.expression,
                        haveDefaultNodeType,
                        caseNodeType.activated_for_languages
                    )
                );
            }

            // Special treatment for languages which have no explicit default node type:
            if (haveNoDefaultNodeType.length > 0) {
                if (caseNodeType.expression == "case_statement") {
                    // Special treatment for "case_statement" which can have more than one child,
                    // because it also has the content of the case block as child(s).
                    //
                    // In this case, a case label can be differentiated from a default label by
                    // checking if there is a child with the field name "value":
                    this.complexityStatementsSuperSet.push(
                        new SimpleLanguageSpecificQueryStatement(
                            "(case_statement value: _ ) @case_statement",
                            haveNoDefaultNodeType,
                            caseNodeType.activated_for_languages
                        )
                    );
                } else {
                    // Default treatment for case-label syntax nodes that are also used for default labels.
                    // Check if the node has a named child. If so, it is a case label and not a default label:
                    this.complexityStatementsSuperSet.push(
                        new SimpleLanguageSpecificQueryStatement(
                            "(" + caseNodeType.expression + " (_) @named_child) @" + caseNodeType.expression,
                            haveNoDefaultNodeType,
                            caseNodeType.activated_for_languages
                        )
                    );
                }
            }
        }
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        const queryBuilder = new QueryBuilder(parseFile, tree);

        if (parseFile.language === Languages.Java) {
            //add query for instance init block in Java
            queryBuilder.setStatements(
                this.complexityStatementsSuperSet.concat(
                    new SimpleQueryStatement("(class_body (block)) @initBlock")
                )
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
            metricValue: matches.length
        };
    }

    getName(): string {
        return FileMetric.complexity;
    }
}
