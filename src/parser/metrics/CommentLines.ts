import { QueryBuilder } from "../queries/QueryBuilder";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import Parser, { QueryMatch, SyntaxNode } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates the number of comment lines.
 * Includes also empty comment lines, etc.
 */
export class CommentLines implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    /**
     * Constructor of the class {@link CommentLines}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        const queryBuilder = new QueryBuilder(parseFile, tree);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        let numberOfLines = 0;
        let lastCommitLine = -1;

        for (const match of matches) {
            const captureNode: SyntaxNode = match.captures[0].node;
            const startRow = captureNode.startPosition.row;
            // If we have not already counted for a comment on the same line:
            if (lastCommitLine != startRow) {
                const endRow = captureNode.endPosition.row;
                numberOfLines += endRow - startRow + 1;
                lastCommitLine = endRow;
            }
        }

        dlog(this.getName() + " - " + numberOfLines);

        return {
            metricName: this.getName(),
            metricValue: numberOfLines,
        };
    }

    getName(): string {
        return FileMetric.commentLines;
    }
}
