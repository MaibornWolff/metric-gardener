import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getExpressionsByCategory, getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { SyntaxNode } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates the number of comment lines.
 * Does not count for empty comment lines, lines with JavaDoc-like documentation block tags (e.g. @param)
 * and file header comments.
 */
export class CommentLines implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];
    private readonly commentExpressions: string[] = [];
    private excludedFileHeaderComments: SyntaxNode[] = [];

    /**
     * Constructor of the class {@link CommentLines}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
        this.commentExpressions = getExpressionsByCategory(allNodeTypes, this.getName(), "comment");
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);
        this.excludedFileHeaderComments = this.getExcludedFileHeaderComments(
            tree.rootNode.children
        );

        const queryBuilder = new QueryBuilder(
            grammars.get(parseFile.language),
            tree,
            parseFile.language
        );
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const commentLines = matches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;

            if (this.isFileHeaderComment(captureNode) || this.isNodeFollowedByClass(captureNode)) {
                return accumulator;
            }

            const commentLinesWithText = this.countTextLines(captureNode.text).length;
            const docBlockLines = this.countDocBlockTagLines(captureNode.text).length;

            return accumulator + commentLinesWithText - docBlockLines;
        }, 0);

        dlog(this.getName() + " - " + commentLines);

        return {
            metricName: this.getName(),
            metricValue: commentLines,
        };
    }

    /**
     * Checks whether there is a class definition following after the specified syntax node.
     * @param node The syntax node to check.
     * @return Whether there is a class definition following.
     * @private
     */
    private isNodeFollowedByClass(node: SyntaxNode) {
        // this is not language independent
        return node.nextSibling?.type.includes("class");
    }

    /**
     * Counts the number of non-empty comment lines in the supplied string.
     *
     * Should exclude most empty comment lines following the inline comment line syntaxes listed in the
     * {@link https://www.researchgate.net/publication/335541386_TAXONOMY_AND_DESIGN_CONSIDERATIONS_FOR_COMMENTS_IN_PROGRAMMING_LANGUAGES_A_QUALITY_PERSPECTIVE|linked paper},
     * the C-style block comment syntax and the "%" syntax, used, e.g., by latex.
     * However, if a non-empty comment line includes only symbols that are included in the comment syntax for one of
     * the supported languages, these lines are incorrectly counted as empty.
     *
     * @param text The text for which non-empty comment lines should be counted.
     * @return The number of non-empty comment lines.
     * @private
     */
    private countTextLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /[^\s/*#%';!-]/g.test(entry));
    }

    /**
     * Counts the number of lines that include JavaDoc-like documentation block tags (e.g. @param) in the supplied string.
     * @param text The text for which the number of lines should be counted.
     * @return The number of lines that include block tags.
     * @private
     */
    private countDocBlockTagLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[\s*]*@[a-z]+/g.test(entry));
    }

    /**
     * Checks whether the specified node represents an excluded file header comment.
     * @param captureNode The node to check.
     * @return Whether the node represents an excluded file header comment.
     * @private
     */
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

    /**
     * Determines all syntax nodes that represent file header comments
     * in order to exclude them from the number of comment lines.
     * @param rootNodeChildren The children of the root note of the syntax tree.
     * @private
     */
    private getExcludedFileHeaderComments(rootNodeChildren: SyntaxNode[]): SyntaxNode[] {
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
