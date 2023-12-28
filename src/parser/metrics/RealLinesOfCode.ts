import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";

export class RealLinesOfCode implements Metric {
    private commentStatementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression, activated_for_languages } = expressionMapping;
                const queryStatement = new ExpressionQueryStatement(
                    expression,
                    activated_for_languages
                );

                if (expressionMapping.category === "comment") {
                    this.commentStatementsSuperSet.push(queryStatement);
                }
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);
        let loc = tree.rootNode.endPosition.row;

        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        loc++;

        const emptyLines = this.countEmptyLines(tree.rootNode.text);

        const queryBuilder = new QueryBuilder(
            grammars.get(parseFile.language),
            tree,
            parseFile.language
        );
        queryBuilder.setStatements(this.commentStatementsSuperSet);

        const commentQuery = queryBuilder.build();
        const commentMatches = commentQuery.matches(tree.rootNode);

        const commentLines = commentMatches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;
            return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1;
        }, 0);

        const realLinesOfCode = Math.max(0, loc - commentLines - emptyLines);
        console.log(this.getName() + " - " + realLinesOfCode);

        return {
            metricName: this.getName(),
            metricValue: realLinesOfCode,
        };
    }

    private countEmptyLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[ \t]*$/.test(entry)).length;
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
