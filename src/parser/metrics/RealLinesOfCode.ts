import { debuglog, type DebugLoggerFunction } from "node:util";
import { type SyntaxNode, type TreeCursor } from "tree-sitter";
import { NodeTypeCategory, type NodeTypeConfig } from "../helper/Model.js";
import { getNodeTypeNamesByCategories } from "../helper/Helper.js";
import { Language } from "../helper/Language.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./Metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, not counting for comments and empty lines.
 */
export class RealLinesOfCode implements Metric {
    private readonly commentStatementsSet: Set<string>;
    private lastCountedLine = -1;

    /**
     * Constructs a new instance of {@link RealLinesOfCode}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.commentStatementsSet = new Set(
            getNodeTypeNamesByCategories(allNodeTypes, NodeTypeCategory.Comment),
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
     */
    walkTree(
        cursor: TreeCursor,
        isComment: (node: SyntaxNode) => boolean,
        countAllLines: (node: SyntaxNode) => boolean,
    ): number {
        let realLinesOfCode = 0;
        const { currentNode } = cursor;
        if (!isComment(currentNode)) {
            if (currentNode.startPosition.row > this.lastCountedLine) {
                this.lastCountedLine = currentNode.startPosition.row;
                realLinesOfCode++;
            }

            // This is a leaf node, so add further lines if it spans over multiple lines and is no line ending:
            if (countAllLines(currentNode)) {
                if (currentNode.endPosition.row > this.lastCountedLine) {
                    realLinesOfCode += currentNode.endPosition.row - currentNode.startPosition.row;
                    this.lastCountedLine = currentNode.endPosition.row;
                }
            } else if (
                currentNode.endPosition.row > currentNode.startPosition.row &&
                cursor.gotoFirstChild() // Recurse, depth-first
            ) {
                realLinesOfCode += this.walkTree(cursor, isComment, countAllLines);
            }
        }

        if (cursor.gotoNextSibling()) {
            realLinesOfCode += this.walkTree(cursor, isComment, countAllLines);
        } else {
            // Completed searching this part of the tree, so go up now.
            cursor.gotoParent();
        }

        return realLinesOfCode;
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const { language, tree } = parsedFile;
        let isCommentFunction: (node: SyntaxNode) => boolean = (node: SyntaxNode) =>
            this.isComment(node);
        let countAllLinesFunction: (node: SyntaxNode) => boolean = isLeafNodeButNoLinebreak;

        switch (language) {
            case Language.Python: {
                isCommentFunction = (node: SyntaxNode): boolean => this.isPythonComment(node);
                break;
            }

            case Language.Bash: {
                countAllLinesFunction = countAllLinesBash;
                break;
            }
        }

        let realLinesOfCode = 0;
        const cursor = tree.walk();

        // Assume the root node is always some kind of program/file/compilation_unit stuff.
        // So if there are no child nodes, the file is empty.
        if (cursor.gotoFirstChild()) {
            this.lastCountedLine = -1;
            realLinesOfCode = this.walkTree(cursor, isCommentFunction, countAllLinesFunction);
        }

        dlog(this.getName() + " - " + realLinesOfCode.toString());

        return {
            metricName: this.getName(),
            metricValue: realLinesOfCode,
        };
    }

    isComment(node: SyntaxNode): boolean {
        return this.commentStatementsSet.has(node.type);
    }

    isPythonComment(node: SyntaxNode): boolean {
        return this.isComment(node) || this.isPythonMultilineComment(node);
    }

    isPythonMultilineComment(node: SyntaxNode): boolean {
        // Multiline comments in python are (multiline) strings that are
        // neither assigned to a variable nor used as a call parameter.
        return (
            node.type === "expression_statement" &&
            node.childCount === 1 &&
            node.child(0)?.type === "string"
        );
    }

    getName(): MetricName {
        return "real_lines_of_code";
    }
}

function isLeafNodeButNoLinebreak(node: SyntaxNode): boolean {
    return node.childCount === 0 && !"\r\n".includes(node.type);
}

function isHeredocBody(node: SyntaxNode): boolean {
    return node.type === "heredoc_body";
}

/**
 * Special handling for Bash heredoc:
 * Because there is no "heredoc_content" in place to represent plain text lines in the heredoc before a command/variable substitution.
 * This is probably a bug in the tree-sitter-bash grammar.
 */
function countAllLinesBash(node: SyntaxNode): boolean {
    return isLeafNodeButNoLinebreak(node) || isHeredocBody(node);
}
