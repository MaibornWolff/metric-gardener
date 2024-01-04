import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, not counting for comments and empty lines.
 */
export class RealLinesOfCode implements Metric {
    private commentStatementsSuperSet: QueryStatementInterface[] = [];

    /**
     * Constructs a new instance of {@link RealLinesOfCode}.
     * @param allNodeTypes List of all configured syntax node types.
     */
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

    async calculate(parseFile: ParseFile): Promise<MetricResult> {
        const tree = await TreeParser.getParseTreeAsync(parseFile);

        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        const loc = tree.rootNode.endPosition.row + 1;

        const emptyLines = this.countEmptyLines(tree.rootNode.text);

        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        const loc = tree.rootNode.endPosition.row + 1;

        const emptyLines = this.countEmptyLines(tree.rootNode.text);

        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        const loc = tree.rootNode.endPosition.row + 1;

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
        dlog(this.getName() + " - " + realLinesOfCode);

        return {
            metricName: this.getName(),
            metricValue: realLinesOfCode,
        };
    }

    /**
     * Counts empty lines within the supplied text.
     * @param text String for which empty lines should be counted.
     * @private
     */
    private countEmptyLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[ \t]*$/.test(entry)).length;
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
