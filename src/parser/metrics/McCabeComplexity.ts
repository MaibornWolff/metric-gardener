import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { binaryOperatorTranslations, ExpressionMetricMapping } from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";

export class McCabeComplexity implements Metric {
    private mccStatementsSuperSet: string[] = [];

    private mccFunctionsAndMethodsSuperSet = [
        "(function) @function",
        "(function_declaration) @function",
        "(function_definition) @function",
        "(method_definition) @function.method",
        "(method_declaration) @function.method",
    ];

    private mccReturnStatementSuperSet = ["(return_statement) @return"];

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

        queryBuilder.clear();
        queryBuilder.setStatements(this.mccFunctionsAndMethodsSuperSet);

        const functionsAndMethodsQuery = queryBuilder.build();
        const functionsOrMethods = functionsAndMethodsQuery.captures(tree.rootNode);

        queryBuilder.clear();
        queryBuilder.setStatements(this.mccReturnStatementSuperSet);

        const returnStatementQuery = queryBuilder.build();

        let additionalReturnStatementComplexity = 0;

        for (const capture of functionsOrMethods) {
            const returnCaptures = returnStatementQuery.captures(capture.node);
            if (returnCaptures.length > 1) {
                additionalReturnStatementComplexity += returnCaptures.length - 1;
            }
        }

        console.log(
            this.getName() + " - " + (matches.length + additionalReturnStatementComplexity)
        );

        return {
            metricName: this.getName(),
            metricValue: matches.length + additionalReturnStatementComplexity,
        };
    }

    getName(): string {
        return "mcc";
    }
}
