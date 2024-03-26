import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines.
 */
export class LinesOfCode implements Metric {
    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { tree } = parsedFile;
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
        return FileMetric.linesOfCode;
    }
}
