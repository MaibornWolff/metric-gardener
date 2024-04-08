import { MetricName, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines.
 */
export class LinesOfCode implements Metric {
    calculate(parsedFile: ParsedFile): MetricResult {
        const { tree } = parsedFile;
        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        const loc = tree.rootNode.endPosition.row + 1;

        dlog(this.getName() + " - " + loc.toString());

        return {
            metricName: this.getName(),
            metricValue: loc,
        };
    }

    getName(): MetricName {
        return "lines_of_code";
    }
}
