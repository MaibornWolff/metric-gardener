import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import Parser, { TreeCursor } from "tree-sitter";
import { getExpressionsByCategory } from "../helper/Helper";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Language } from "../helper/Language";

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
        const { currentNode } = cursor;
        if (!isComment(currentNode)) {
            realLinesOfCode.add(currentNode.startPosition.row);

            // This is a leaf node, so add further lines if it spans over multiple lines and is no line ending:
            if (currentNode.childCount === 0 && !"\r\n".includes(currentNode.type)) {
                for (
                    let i = currentNode.startPosition.row + 1;
                    i <= currentNode.endPosition.row;
                    i++
                ) {
                    realLinesOfCode.add(i);
                }
            } else if (currentNode.endPosition.row > currentNode.startPosition.row) {
                // Recurse, depth-first
                if (cursor.gotoFirstChild()) {
                    this.walkTree(cursor, isComment, realLinesOfCode);
                }
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

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        let isCommentFunction: (node: Parser.SyntaxNode) => boolean;

        if (language == Language.Python) {
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
            console.log(realLinesOfCode);
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

    isPythonComment(node: Parser.SyntaxNode) {
        return this.isComment(node) || this.isPythonMultilineComment(node);
    }

    isPythonMultilineComment(node: Parser.SyntaxNode) {
        // Multiline comments in python are (multiline) strings that are
        // neither assigned to a variable nor used as a call parameter.
        return (
            node.type === "expression_statement" &&
            node.childCount === 1 &&
            node.child(0)?.type === "string"
        );
    }

    getName(): string {
        return FileMetric.realLinesOfCode;
    }
}
