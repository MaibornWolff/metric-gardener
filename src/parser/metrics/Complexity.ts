import { QueryBuilder } from "../queries/QueryBuilder";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    OperatorQueryStatement,
    QueryStatementInterface,
    SimpleQueryStatement,
} from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import Parser, { QueryMatch } from "tree-sitter";
import { Languages } from "../helper/Languages";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Complexity implements Metric {
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
        if (parseFile.language === Languages.Java) {
            //add query for instance init block in Java
            queryBuilder.setStatements(
                this.mccStatementsSuperSet.concat(
                    new SimpleQueryStatement("(class_body (block)) @initBlock")
                )
            );
        } else {
            queryBuilder.setStatements(this.mccStatementsSuperSet);
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
