import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import Parser from "tree-sitter";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines.
 */
export class LinesOfCode implements Metric {
    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        const loc = tree.rootNode.endPosition.row + 1;

        dlog(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: loc,
        };
    }

    getName(): string {
        return "lines_of_code";
    }
}
