import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    OperatorQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog } from "node:util";

const dlog = debuglog("metric-gardener");

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

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(
            grammars.get(parseFile.language),
            tree,
            parseFile.language
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
