import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";

export class LinesOfCode implements Metric {
    private startRuleStatementsSuperSet = [];
    private treeParser: TreeParser;

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression } = expressionMapping;
                this.startRuleStatementsSuperSet.push("(" + expression + ") @" + expression);
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.startRuleStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const loc = matches.length > 0 ? matches[0].captures[0].node.endPosition.row : 0;
        console.log(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "lines_of_code";
    }
}
