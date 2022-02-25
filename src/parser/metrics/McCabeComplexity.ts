import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { binaryOperatorTranslations, ExpressionMetricMapping } from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";

export class McCabeComplexity implements Metric {
    private mccStatementsSuperSet: string[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (expressionMapping.metrics.includes(this.getName())) {
                if (expressionMapping.type === "statement") {
                    const { expression, category, operator } = expressionMapping;
                    if (category === "binary_expression" && operator !== undefined) {
                        this.mccStatementsSuperSet.push(
                            "(" +
                                category +
                                ' operator: "' +
                                operator +
                                '") @binary_expression_' +
                                binaryOperatorTranslations.get(operator)
                        );
                    } else {
                        this.mccStatementsSuperSet.push("(" + expression + ") @" + expression);
                    }
                }
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.mccStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        console.log(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "mcc";
    }
}
