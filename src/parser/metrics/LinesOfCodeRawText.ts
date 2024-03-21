import { FileMetric, MetricResult } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines, without the need to use a language grammar.
 */
export function calculateLinesOfCodeRawText(sourceCode: string): MetricResult {
    const loc = sourceCode.split(/\r\n|\r|\n/g).length;

    dlog(FileMetric.linesOfCode + " - raw text - " + loc.toString());

    return {
        metricName: FileMetric.linesOfCode,
        metricValue: loc,
    };
}
