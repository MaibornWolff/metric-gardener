import { QueryBuilder } from "../queries/QueryBuilder";
import { fileExtensionToGrammar } from "../helper/FileExtensionToGrammar";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getExpressionsByCategory, getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { SyntaxNode } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class CommentLines implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];
    private readonly commentExpressions: string[] = [];
    private excludedFileHeaderComments: SyntaxNode[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
        this.commentExpressions = getExpressionsByCategory(allNodeTypes, this.getName(), "comment");
    }

    async calculate(parseFile: ParseFile): Promise<MetricResult> {
        const tree = await TreeParser.getParseTreeAsync(parseFile);
        this.excludedFileHeaderComments = this.getExcludedFileHeaderComments(
            tree.rootNode.children
        );

        const queryBuilder = new QueryBuilder(
            fileExtensionToGrammar.get(parseFile.fileExtension),
            tree,
            parseFile.fileExtension
        );
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const commentLines = matches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;

            if (
                this.isFileHeaderComment(captureNode) ||
                this.isCommentFollowedByClass(captureNode)
            ) {
                return accumulator;
            }

            const commentLinesWithText = this.findTextLines(captureNode.text).length;
            const docBlockLines = this.findDocBlockLines(captureNode.text).length;

            return accumulator + commentLinesWithText - docBlockLines;
        }, 0);

        dlog(this.getName() + " - " + commentLines);

        return {
            metricName: this.getName(),
            metricValue: commentLines,
        };
    }

    private isCommentFollowedByClass(node: SyntaxNode) {
        // this is not language independent
        return node.nextSibling?.type.includes("class");
    }

    private findTextLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /[a-zA-Z0-9]+/g.test(entry));
    }

    private findDocBlockLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[ *]*@[a-z]+/g.test(entry));
    }

    private isFileHeaderComment(captureNode: SyntaxNode) {
        return this.excludedFileHeaderComments.some((excludedComment) => {
            return (
                excludedComment.startPosition.row === captureNode.startPosition.row &&
                excludedComment.startPosition.column === captureNode.startPosition.column &&
                excludedComment.endPosition.row === captureNode.endPosition.row &&
                excludedComment.endPosition.column === captureNode.endPosition.column
            );
        });
    }

    private getExcludedFileHeaderComments(rootNodeChildren): SyntaxNode[] {
        const excludedComments: SyntaxNode[] = [];
        const clonedChildren = [...rootNodeChildren];

        if (clonedChildren[0] && this.commentExpressions.includes(clonedChildren[0]?.type)) {
            // The very first elements that are comments are assumed to belong to a licence/copyright comment
            let hasFollowingComments = this.commentExpressions.includes(clonedChildren[0]?.type);

            while (hasFollowingComments) {
                excludedComments.push(clonedChildren.shift() as SyntaxNode);
                hasFollowingComments = this.commentExpressions.includes(clonedChildren[0]?.type);
            }
        }

        return excludedComments;
    }

    getName(): string {
        return "comment_lines";
    }
}
