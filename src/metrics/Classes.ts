import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { ExpressionMetricMapping } from "../app";
import { TreeParser } from "../helper/TreeParser";

export class Classes implements Metric {
    private classesStatementsSuperSet = [];
    private treeParser: TreeParser;

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression } = expressionMapping;
                this.classesStatementsSuperSet.push("(" + expression + ") @" + expression);
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.classesStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        console.log(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "classes";
    }
}
