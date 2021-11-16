import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { ExpressionMetricMapping } from "../app";
import { TreeParser } from "../helper/TreeParser";

export class CommentLines implements Metric {
    private commentStatementsSuperSet = [];
    private treeParser: TreeParser;

    constructor(allNodeTypes: ExpressionMetricMapping[], treeParser: TreeParser) {
        this.treeParser = treeParser;
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression } = expressionMapping;
                this.commentStatementsSuperSet.push("(" + expression + ") @" + expression);
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.commentStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const commentLines = matches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;
            return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1;
        }, 0);

        console.log(this.getName() + " - " + commentLines);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "comment_lines";
    }
}
