import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryCapture, type SyntaxNode } from "tree-sitter";
import { QueryBuilder } from "../queries/query-builder.js";
import { NodeTypeCategory, type NodeTypeConfig } from "../../helper/model.js";
import { getQueryStatementsByCategories } from "../../helper/helper.js";
import {
    type QueryStatement,
    SimpleLanguageSpecificQueryStatement,
} from "../queries/query-statements.js";
import { Language } from "../../helper/language.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates the number of comment lines.
 * Includes also empty comment lines, etc.
 */
export class CommentLines implements Metric {
    readonly #statementsSuperSet: QueryStatement[] = [];

    /**
     * Constructor of the class {@link CommentLines}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.#statementsSuperSet = getQueryStatementsByCategories(
            allNodeTypes,
            NodeTypeCategory.Comment,
        );
        this.#addQueriesForPython();
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const captures = this.getQueryCapturesFrom(parsedFile);

        let numberOfLines = 0;
        let lastCommentLine = -1;

        for (const capture of captures) {
            const captureNode = capture.node;
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

        dlog(this.getName() + " - " + numberOfLines.toString());

        return {
            metricName: this.getName(),
            metricValue: numberOfLines,
        };
    }

    getQueryCapturesFrom(parsedFile: ParsedFile): QueryCapture[] {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);

        queryBuilder.addStatements(this.#statementsSuperSet);

        const query = queryBuilder.build();
        let queryCaptures: QueryCapture[] = [];
        if (query !== undefined) {
            queryCaptures = query.captures(tree.rootNode);
        }

        return queryCaptures;
    }

    getName(): MetricName {
        return "comment_lines";
    }

    #addQueriesForPython(): void {
        this.#statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(expression_statement (string)) @python_multiline_comment",
                new Set([Language.Python]),
            ),
        );
    }
}
