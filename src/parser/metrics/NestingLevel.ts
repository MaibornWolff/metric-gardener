import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { TreeCursor } from "tree-sitter";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Calculates maximum nesting level of a json file.
 */
export class NestingLevel implements Metric {
    private nodeTypesToCount: string[] = [];

    /**
     * Constructs a new instance of {@link NestingLevel}.
     * @param allNodeTypes List of all configured syntax node types.
     */
    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        for (const nodeType of allNodeTypes) {
            if (nodeType.metrics.includes(this.getName())) {
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

        let nestingLevel = 0;
        const cursor = tree.walk();

        if (cursor.gotoFirstChild()) {
            nestingLevel = this.walkTree(cursor);
        }

        dlog(this.getName() + " - " + nestingLevel);

        return {
            metricName: this.getName(),
            metricValue: nestingLevel,
        };
    }

    getName(): string {
        return FileMetric.nestingLevel;
    }
}
