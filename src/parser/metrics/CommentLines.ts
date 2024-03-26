import { QueryBuilder } from "../queries/QueryBuilder.js";
import { NodeTypeCategory, NodeTypeConfig } from "../helper/Model.js";
import { getQueryStatementsByCategories } from "../helper/Helper.js";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { QueryMatch, SyntaxNode } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Language } from "../helper/Language.js";
import { QueryStatementInterface, SimpleQueryStatement } from "../queries/QueryStatements.js";

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
    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.statementsSuperSet = getQueryStatementsByCategories(
            allNodeTypes,
            NodeTypeCategory.Comment,
        );
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const additionalStatements: QueryStatementInterface[] = [];
        switch (language) {
            case Language.Python:
                additionalStatements.push(
                    new SimpleQueryStatement(
                        "(expression_statement (string)) @python_multiline_comment",
                    ),
                );
                break;
        }

        const queryBuilder = new QueryBuilder(language);

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
