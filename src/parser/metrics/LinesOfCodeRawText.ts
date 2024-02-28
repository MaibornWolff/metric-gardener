import { SourceFile, FileMetric, MetricResult } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import fs from "fs";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Counts the number of lines in a file, including empty lines, without the need to use a language grammar.
 */
export class LinesOfCodeRawText {
    static async calculate(file: SourceFile): Promise<MetricResult> {
        const sourceCode = await fs.promises.readFile(file.filePath, { encoding: "utf8" });

        const loc = sourceCode.split(/\r\n|\r|\n/).length;
        dlog(FileMetric.linesOfCode + " - raw text - " + loc);

        return {
            metricName: FileMetric.linesOfCode,
            metricValue: loc,
        };
    }
}
