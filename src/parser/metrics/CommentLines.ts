import { QueryBuilder } from "../queries/QueryBuilder";
import {
    ExpressionMetricMapping,
    QueryStatementInterface,
    SimpleQueryStatement,
} from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import Parser, { QueryMatch, SyntaxNode } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Languages } from "../helper/Languages";

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
        const additionalStatements: QueryStatementInterface[] = [];
        switch (parseFile.language) {
            case Languages.Python:
                additionalStatements.push(
                    new SimpleQueryStatement(
                        "(expression_statement (string)) @python_multiline_comment"
                    )
                );
                break;
        }

        const queryBuilder = new QueryBuilder(parseFile, tree);

        if (additionalStatements.length === 0) {
            queryBuilder.setStatements(this.statementsSuperSet);
        } else {
            // Important to use concat() here, because we do not want to change this.statementSuperSet:
            queryBuilder.setStatements(this.statementsSuperSet.concat(additionalStatements));
        }

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        let numberOfLines = 0;
        let lastCommentLine = -1;

        for (const match of matches) {
            const captureNode: SyntaxNode = match.captures[0].node;
            const startRow = captureNode.startPosition.row;
            const endRow = captureNode.endPosition.row;
            // If we have not already counted for a comment on the same line:
            if (lastCommentLine !== startRow) {
                numberOfLines += endRow - startRow + 1;
                lastCommentLine = endRow;
            }
            // If the comment starts on the same line as the last one, but does span over more lines than that:
            else if (lastCommentLine < endRow) {
                numberOfLines += endRow - startRow;
                lastCommentLine = endRow;
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
