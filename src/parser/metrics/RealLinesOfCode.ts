import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { TreeCursor } from "tree-sitter";
import { getExpressionsByCategory } from "../helper/Helper";
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

    walkTree(cursor: TreeCursor, commentLines: Set<number>, sureCodeLines: Set<number>) {
        // This is a comment, so add its lines to the comment lines.
        if (this.commentStatementsSet.has(cursor.currentNode.type)) {
            for (let i = cursor.startPosition.row; i < cursor.endPosition.row; i++) {
                commentLines.add(i);
            }
        } else {
            // Assume that first and last line of whatever kind of node this is, is a real code line.
            // Unsure if this assumption holds for all kinds of (composed) statements.
            // It should hold for loops and if-statements in most/all (?) languages.
            sureCodeLines.add(cursor.startPosition.row);
            sureCodeLines.add(cursor.endPosition.row);
            console.log("Added " + cursor.startPosition.row + " and " + cursor.endPosition.row);
        }
        // Recurse, depth-first
        if (cursor.gotoFirstChild()) {
            this.walkTree(cursor, commentLines, sureCodeLines);
        }
        if (cursor.gotoNextSibling()) {
            this.walkTree(cursor, commentLines, sureCodeLines);
        } else {
            // Completed searching this part of the tree, so go up now.
            cursor.gotoParent();
        }
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);

        const commentLines = new Set<number>();
        const sureCodeLines = new Set<number>();

        const cursor = tree.walk();
        // Assume root node is always some kind of program/file/compilation_unit stuff?
        cursor.gotoFirstChild();
        this.walkTree(cursor, commentLines, sureCodeLines);

        console.log(tree.rootNode.toString());
        console.log(sureCodeLines);

        const rloc = sureCodeLines.size;

        dlog(this.getName() + " - " + rloc);

        return {
            metricName: this.getName(),
            metricValue: rloc,
        };
    }

    /**
     * Counts empty lines within the supplied text.
     * @param text String for which empty lines should be counted.
     * @private
     */
    private countEmptyLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[ \t]*$/.test(entry)).length;
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
