import { ExpressionMetricMapping, NodeTypeCategory } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { TreeCursor } from "tree-sitter";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates maximum nesting level of a json file.
 */
export class MaxNestingLevel implements Metric {
    private nodeTypesToCount: string[] = [];

    /**
     * Constructs a new instance of {@link MaxNestingLevel}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        for (const nodeType of allNodeTypes) {
            if (nodeType.category === NodeTypeCategory.Nesting) {
                this.nodeTypesToCount.push(nodeType.expression);
            }
        }
    }

    /**
     * Recursive traversal of the syntax tree to calculate the height.
     *
     * Uses a {@link TreeCursor} for this, as according to the
     * {@link https://tree-sitter.github.io/tree-sitter/using-parsers#walking-trees-with-tree-cursors|Tree-sitter documentation},
     * this is the most efficient way to traverse a syntax tree.
     * @param cursor A {@link TreeCursor} for the syntax tree.
     */
    walkTree(cursor: TreeCursor) {
        let maxChildHeight = 0;

        if (cursor.gotoFirstChild()) {
            do {
                const childHeight = this.walkTree(cursor);
                if (childHeight > maxChildHeight) {
                    maxChildHeight = childHeight;
                }
            } while (cursor.gotoNextSibling());
            cursor.gotoParent();
        }

        if (this.nodeTypesToCount.includes(cursor.currentNode.type)) {
            return 1 + maxChildHeight;
        } else {
            return maxChildHeight;
        }
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;

        let maxNestingLevel = 0;
        const cursor = tree.walk();

        if (cursor.gotoFirstChild()) {
            maxNestingLevel = this.walkTree(cursor);
            // -1 for top level
            maxNestingLevel = Math.max(maxNestingLevel - 1, 0);
        }

        dlog(this.getName() + " - " + maxNestingLevel);

        return {
            metricName: this.getName(),
            metricValue: maxNestingLevel,
        };
    }

    getName(): string {
        return FileMetric.maxNestingLevel;
    }
}
