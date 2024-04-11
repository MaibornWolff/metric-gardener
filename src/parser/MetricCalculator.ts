import { debuglog, type DebugLoggerFunction } from "node:util";
import fs from "node:fs/promises";
import { Complexity } from "./metrics/Complexity.js";
import { Functions } from "./metrics/Functions.js";
import { Classes } from "./metrics/Classes.js";
import { LinesOfCode } from "./metrics/LinesOfCode.js";
import { CommentLines } from "./metrics/CommentLines.js";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode.js";
import { type NodeTypeConfig } from "./helper/Model.js";
import {
    ErrorFile,
    type FileMetricResults,
    type MetricError,
    type MetricResult,
    ParsedFile,
    type SourceFile,
} from "./metrics/Metric.js";
import nodeTypesConfig from "./config/nodeTypesConfig.json" with { type: "json" };
import { MaxNestingLevel } from "./metrics/MaxNestingLevel.js";
import { calculateLinesOfCodeRawText } from "./metrics/LinesOfCodeRawText.js";
import { FileType } from "./helper/Language.js";
import { KeywordsInComments } from "./metrics/KeywordsInComments.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

const allNodeTypes = nodeTypesConfig as NodeTypeConfig[];
const sourceFileMetrics = [
    new Complexity(allNodeTypes),
    new Functions(allNodeTypes),
    new Classes(allNodeTypes),
    new LinesOfCode(),
    new CommentLines(allNodeTypes),
    new RealLinesOfCode(allNodeTypes),
    new KeywordsInComments(allNodeTypes),
];
const structuredTextFileMetrics = [new LinesOfCode(), new MaxNestingLevel(allNodeTypes)];

/**
 * Calculates file metrics on the specified file.
 * @param sourceFile Source file for which the metric should be calculated.
 * @return A tuple that contains the representation of the file and
 * the calculated metrics.
 */
export async function calculateMetrics(
    sourceFile: SourceFile,
): Promise<[SourceFile, FileMetricResults]> {
    if (sourceFile instanceof ErrorFile) {
        return [sourceFile, { fileType: sourceFile.fileType, metricResults: [], metricErrors: [] }];
    }

    const metricResults: MetricResult[] = [];
    const metricErrors: MetricError[] = [];

    if (sourceFile instanceof ParsedFile) {
        dlog(
            " ------------ Parsing file metrics for file " +
                sourceFile.filePath +
                ":  ------------ ",
        );

        const metricsToCalculate =
            sourceFile.fileType === FileType.SourceCode
                ? sourceFileMetrics
                : structuredTextFileMetrics;

        for (const metric of metricsToCalculate) {
            try {
                metricResults.push(metric.calculate(sourceFile));
            } catch (error_) {
                const error = error_ instanceof Error ? error_ : new Error(String(error_));
                metricErrors.push({ metricName: metric.getName(), error });
            }
        }
    } else {
        // Unsupported file: only calculate metrics based on the raw source code
        try {
            // Reading a file might fail, catch that
            const sourceCode = await fs.readFile(sourceFile.filePath, { encoding: "utf8" });
            metricResults.push(calculateLinesOfCodeRawText(sourceCode)); // Should never throw
        } catch (error_) {
            const error = error_ instanceof Error ? error_ : new Error(String(error_));
            metricErrors.push({ metricName: "lines_of_code", error });
        }
    }

    return [sourceFile, { fileType: sourceFile.fileType, metricResults, metricErrors }];
}
