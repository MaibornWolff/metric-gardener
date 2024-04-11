import { debuglog, type DebugLoggerFunction } from "node:util";
import { type MetricResult } from "./Metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines, without the need to use a language grammar.
 */
export function calculateLinesOfCodeRawText(sourceCode: string): MetricResult {
    const loc = sourceCode.split(/\r\n|\r|\n/g).length;

    dlog("lines_of_code - raw text - " + loc.toString());

    return {
        metricName: "lines_of_code",
        metricValue: loc,
    };
}
