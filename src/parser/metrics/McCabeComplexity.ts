import { QueryBuilder } from "../queries/QueryBuilder";
import { fileExtensionToGrammar } from "../helper/FileExtensionToGrammar";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    OperatorQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import Parser from "tree-sitter";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class McCabeComplexity implements Metric {
    private mccStatementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (expressionMapping.metrics.includes(this.getName())) {
                if (expressionMapping.type === "statement") {
                    const { expression, category, operator, activated_for_languages } =
                        expressionMapping;

                    if (category === "binary_expression" && operator !== undefined) {
                        this.mccStatementsSuperSet.push(
                            new OperatorQueryStatement(category, operator, activated_for_languages)
                        );
                    } else {
                        this.mccStatementsSuperSet.push(
                            new ExpressionQueryStatement(expression, activated_for_languages)
                        );
                    }
                }
            }
        });
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        const queryBuilder = new QueryBuilder(
            fileExtensionToGrammar.get(parseFile.fileExtension),
            tree,
            parseFile.fileExtension
        );
        queryBuilder.setStatements(this.mccStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "mcc";
    }
}
