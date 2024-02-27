import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { SyntaxNode, TreeCursor } from "tree-sitter";
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
            getExpressionsByCategory(allNodeTypes, this.getName(), "comment"),
        );
    }

    /**
     * Waling through the tree in order to find actual code lines.
     *
     * Uses a {@link TreeCursor} for this, as according to the
     * {@link https://tree-sitter.github.io/tree-sitter/using-parsers#walking-trees-with-tree-cursors|Tree-sitter documentation},
     * this is the most efficient way to traverse a syntax tree.
     * @param cursor A {@link TreeCursor} for the syntax tree.
     * @param isComment Function that checks whether a node is a comment or not.
     * @param countAllLines Function that checks whether to count all lines of a node.
     * @param realLinesOfCode A set in which the line numbers of the found code lines are stored.
     */
    walkTree(
        cursor: TreeCursor,
        isComment: (node: SyntaxNode) => boolean,
        countAllLines: (node: SyntaxNode) => boolean,
        realLinesOfCode = new Set<number>(),
    ) {
        const { currentNode } = cursor;
        if (!isComment(currentNode)) {
            realLinesOfCode.add(currentNode.startPosition.row);

            // This is a leaf node, so add further lines if it spans over multiple lines and is no line ending:
            if (countAllLines(currentNode)) {
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
                    this.walkTree(cursor, isComment, countAllLines, realLinesOfCode);
                }
            }
        }

        if (cursor.gotoNextSibling()) {
            this.walkTree(cursor, isComment, countAllLines, realLinesOfCode);
        } else {
            // Completed searching this part of the tree, so go up now.
            cursor.gotoParent();
        }
        return realLinesOfCode;
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        let isCommentFunction: (node: SyntaxNode) => boolean = (node: SyntaxNode) =>
            this.isComment(node);
        let countAllLinesFunction: (node: SyntaxNode) => boolean = isLeafNodeButNoLinebreak;

        switch (language) {
            case Language.Python:
                isCommentFunction = (node: SyntaxNode) => this.isPythonComment(node);
                break;
            case Language.Bash:
                countAllLinesFunction = countAllLinesBash;
                break;
        }

        let rloc = 0;
        const cursor = tree.walk();

        // Assume the root node is always some kind of program/file/compilation_unit stuff.
        // So if there are no child nodes, the file is empty.
        if (cursor.gotoFirstChild()) {
            const realLinesOfCode = this.walkTree(cursor, isCommentFunction, countAllLinesFunction);
            dlog("Included lines for rloc: ", realLinesOfCode);
            rloc = realLinesOfCode.size;
        }

        dlog(this.getName() + " - " + rloc);

        return {
            metricName: this.getName(),
            metricValue: rloc,
        };
    }

    isComment(node: SyntaxNode) {
        return this.commentStatementsSet.has(node.type);
    }

    isPythonComment(node: SyntaxNode) {
        return this.isComment(node) || this.isPythonMultilineComment(node);
    }

    isPythonMultilineComment(node: SyntaxNode) {
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

function isLeafNodeButNoLinebreak(node: SyntaxNode): boolean {
    return node.childCount === 0 && !"\r\n".includes(node.type);
}

function isHereDocBody(node: SyntaxNode): boolean {
    return node.type === "heredoc_body";
}
function countAllLinesBash(node: SyntaxNode): boolean {
    return isLeafNodeButNoLinebreak(node) || isHereDocBody(node);
}
