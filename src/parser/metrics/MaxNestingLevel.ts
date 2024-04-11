import { debuglog, type DebugLoggerFunction } from "node:util";
import { type TreeCursor } from "tree-sitter";
import { type NodeTypeConfig, NodeTypeCategory } from "../helper/Model.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./Metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates maximum nesting level of a json file.
 */
export class MaxNestingLevel implements Metric {
    private readonly nodeTypesToCount: string[] = [];

    /**
     * Constructs a new instance of {@link MaxNestingLevel}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: NodeTypeConfig[]) {
        for (const nodeType of allNodeTypes) {
            if (nodeType.category === NodeTypeCategory.Nesting) {
                this.nodeTypesToCount.push(nodeType.type_name);
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
    walkTree(cursor: TreeCursor): number {
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
        }

        return maxChildHeight;
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const { tree } = parsedFile;

        let maxNestingLevel = 0;
        const cursor = tree.walk();

        if (cursor.gotoFirstChild()) {
            maxNestingLevel = this.walkTree(cursor);
            // -1 for top level
            maxNestingLevel = Math.max(maxNestingLevel - 1, 0);
        }

        dlog(this.getName() + " - " + maxNestingLevel.toString());

        return {
            metricName: this.getName(),
            metricValue: maxNestingLevel,
        };
    }

    getName(): MetricName {
        return "max_nesting_level";
    }
}
