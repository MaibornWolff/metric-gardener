import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParseFile } from "./Metric";
import Parser, { TreeCursor } from "tree-sitter";
import { getExpressionsByCategory } from "../helper/Helper";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Languages } from "../helper/Languages";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, not counting for comments and empty lines.
 */
export class RealLinesOfCode implements Metric {
    private commentStatementsSet: Set<string>;

    /**
     * Constructs a new instance of {@link RealLinesOfCode}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.commentStatementsSet = new Set(
            getExpressionsByCategory(allNodeTypes, this.getName(), "comment")
        );
    }

    /**
     * Waling through the tree in order to find actual code lines.
     *
     * Uses a {@link TreeCursor} for this, as according to the
     * {@link https://tree-sitter.github.io/tree-sitter/using-parsers#walking-trees-with-tree-cursors|Tree-sitter documentation},
     * this is the most efficient way to traverse a syntax tree.
     * @param cursor A {@link TreeCursor} for the syntax tree.
     * @param realLinesOfCode A set in which the line numbers of the found code lines are stored.
     * @param isComment Function that checks whether a node is a comment or not.
     */
    walkTree(
        cursor: TreeCursor,
        isComment: (node: Parser.SyntaxNode) => boolean,
        realLinesOfCode = new Set<number>()
    ) {
        // This is not a comment syntax node, so assume it includes "real code".
        if (!isComment(cursor.currentNode)) {
            // Assume that first and last line of whatever kind of node this is, is a real code line.
            // This assumption should hold for all kinds of block/composed statements in (hopefully) all languages.
            realLinesOfCode.add(cursor.startPosition.row);

            // This is a leaf node, so add further lines if this single token of actual code
            // spans over multiple lines and is no line ending:
            if (cursor.currentNode.childCount == 0 && !"\r\n".includes(cursor.currentNode.type)) {
                for (let i = cursor.startPosition.row + 1; i <= cursor.endPosition.row; i++) {
                    realLinesOfCode.add(i);
                }
            }

            // Recurse, depth-first
            if (cursor.gotoFirstChild()) {
                this.walkTree(cursor, isComment, realLinesOfCode);
            }
        }
        if (cursor.gotoNextSibling()) {
            this.walkTree(cursor, isComment, realLinesOfCode);
        } else {
            // Completed searching this part of the tree, so go up now.
            cursor.gotoParent();
        }
        return realLinesOfCode;
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        let isCommentFunction: (node: Parser.SyntaxNode) => boolean;

        if (parseFile.language == Languages.Python) {
            // Special treatment for python multiline comments:
            isCommentFunction = (node: Parser.SyntaxNode) => this.isPythonComment(node);
        } else {
            isCommentFunction = (node: Parser.SyntaxNode) => this.isComment(node);
        }

        let rloc = 0;
        const cursor = tree.walk();

        // Assume the root node is always some kind of program/file/compilation_unit stuff.
        // So if there are no child nodes, the file is empty.
        if (cursor.gotoFirstChild()) {
            const realLinesOfCode = this.walkTree(cursor, isCommentFunction);
            dlog("Included lines for rloc: ", realLinesOfCode);
            rloc = realLinesOfCode.size;
        }

        dlog(this.getName() + " - " + rloc);

        return {
            metricName: this.getName(),
            metricValue: rloc,
        };
    }

    isComment(node: Parser.SyntaxNode) {
        return this.commentStatementsSet.has(node.type);
    }

    /**
     * Checks whether the node should count as a comment in python.
     *
     * Adds special handling for python multiline comments:
     * Multiline comments in python are (multiline) strings that are
     * neither assigned to a variable nor used as call parameter.
     */
    isPythonComment(node: Parser.SyntaxNode) {
        return (
            this.isComment(node) ||
            // Special handling for multiline comments:
            (node.type === "expression_statement" &&
                node.childCount === 1 &&
                node.child(0)?.type === "string")
        );
    }

    getName(): string {
        return FileMetric.realLinesOfCode;
    }
}
