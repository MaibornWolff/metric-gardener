import { QueryBuilder } from "../queries/QueryBuilder";
import { fileExtensionToGrammar } from "../helper/FileExtensionToGrammar";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import Parser, { SyntaxNode } from "tree-sitter";

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
        const queryBuilder = new QueryBuilder(
            fileExtensionToGrammar.get(parseFile.fileExtension),
            tree,
            parseFile.fileExtension
        );
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const commentLines = new Set<number>();
        for (const match of matches) {
            const captureNode: SyntaxNode = match.captures[0].node;
            for (let i = captureNode.startPosition.row; i <= captureNode.endPosition.row; i++) {
                commentLines.add(i);
            }
        }

        dlog(this.getName() + " - " + commentLines.size);

        return {
            metricName: this.getName(),
            metricValue: commentLines.size,
        };
    }

    getName(): string {
        return "comment_lines";
    }
}
