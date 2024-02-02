import { QueryBuilder } from "../queries/QueryBuilder";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    OperatorQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
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
                    const { expression, category, operator, activated_for_languages, languages } =
                        expressionMapping;

                    if (category === "binary_expression" && operator !== undefined) {
                        this.mccStatementsSuperSet.push(
                            new OperatorQueryStatement(
                                category,
                                operator,
                                languages,
                                activated_for_languages
                            )
                        );
                    } else {
                        this.mccStatementsSuperSet.push(
                            new ExpressionQueryStatement(
                                expression,
                                languages,
                                activated_for_languages
                            )
                        );
                    }
                }
            }
        });
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        const queryBuilder = new QueryBuilder(parseFile, tree);
        queryBuilder.setStatements(this.mccStatementsSuperSet);

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
        return FileMetric.mcCabeComplexity;
    }
}
