import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";

export class RealLinesOfCode implements Metric {
    private classesStatementSuperSet = [];
    private startRuleStatementsSuperSet = [];
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

                if (expressionMapping.category === "start_rule") {
                    this.startRuleStatementsSuperSet.push("(" + expression + ") @" + expression);
                } else if (expressionMapping.category === "comment") {
                    this.commentStatementsSuperSet.push("(" + expression + ") @" + expression);
                }

                this.classesStatementSuperSet.push("(" + expression + ") @" + expression);
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = this.treeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.startRuleStatementsSuperSet);

        const query = queryBuilder.build();
        const startRuleMatches = query.matches(tree.rootNode);

        const loc =
            startRuleMatches.length > 0 ? startRuleMatches[0].captures[0].node.endPosition.row : 0;

        queryBuilder.clear();
        queryBuilder.setStatements(this.commentStatementsSuperSet);

        const commentQuery = queryBuilder.build();
        const commentMatches = commentQuery.matches(tree.rootNode);

        const commentLines = commentMatches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;
            return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1;
        }, 0);

        const realLinesOfCode = Math.max(0, loc - commentLines);
        console.log(this.getName() + " - " + realLinesOfCode);

        return {
            metricName: this.getName(),
            metricValue: realLinesOfCode,
        };
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
