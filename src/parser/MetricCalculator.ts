import { Complexity } from "./metrics/Complexity.js";
import { Functions } from "./metrics/Functions.js";
import { Classes } from "./metrics/Classes.js";
import { LinesOfCode } from "./metrics/LinesOfCode.js";
import { CommentLines } from "./metrics/CommentLines.js";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode.js";
import { NodeTypeConfig } from "./helper/Model.js";
import {
    FileMetric,
    FileMetricResults,
    isErrorFile,
    isParsedFile,
    Metric,
    MetricError,
    MetricResult,
    SourceFile,
} from "./metrics/Metric.js";
import nodeTypesConfig from "./config/nodeTypesConfig.json" with { type: "json" };
import { debuglog, DebugLoggerFunction } from "node:util";
import { MaxNestingLevel } from "./metrics/MaxNestingLevel.js";
import { LinesOfCodeRawText } from "./metrics/LinesOfCodeRawText.js";
import fs from "fs/promises";
import { FileType } from "./helper/Language.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Arranges the calculation of all basic single file metrics on multiple files.
 */
export class MetricCalculator {
    readonly #sourceFileMetrics: Metric[] = [];
    readonly #structuredTextFileMetrics: Metric[] = [];

    /**
     * Constructs a new instance of {@link MetricCalculator} for arranging the calculation of all
     * basic single file metrics on multiple files.
     */
    constructor() {
        const allNodeTypes: NodeTypeConfig[] = nodeTypesConfig as NodeTypeConfig[];

        this.#sourceFileMetrics = [
            new Complexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
        ];

        this.#structuredTextFileMetrics = [new LinesOfCode(), new MaxNestingLevel(allNodeTypes)];
    }

    /**
     * Calculates file metrics on the specified file.
     * @param parsedFilePromise Promise for a parsed file for which the metric should be calculated.
     * @return A tuple that contains the representation of the file and
     * the calculated metrics.
     */
    async calculateMetrics(
        parsedFilePromise: Promise<SourceFile>,
    ): Promise<[SourceFile, FileMetricResults]> {
        const sourceFile = await parsedFilePromise;

        if (isErrorFile(sourceFile)) {
            return [
                sourceFile,
                { fileType: sourceFile.fileType, metricResults: [], metricErrors: [] },
            ];
        }

        const metricErrors: MetricError[] = [];
        const resultPromises: Promise<MetricResult | null>[] = [];

        if (isParsedFile(sourceFile)) {
            dlog(
                " ------------ Parsing file metrics for file " +
                    sourceFile.filePath +
                    ":  ------------ ",
            );

            const metricsToCalculate =
                sourceFile.fileType === FileType.SourceCode
                    ? this.#sourceFileMetrics
                    : this.#structuredTextFileMetrics;

            for (const metric of metricsToCalculate) {
                resultPromises.push(
                    metric.calculate(sourceFile).catch((reason) => {
                        metricErrors.push({ metricName: metric.getName(), error: reason });
                        return null;
                    }),
                );
            }
        } else {
            // Unsupported file: only calculate metrics based on the raw source code
            try {
                // Reading a file might fail, catch that
                const sourceCode = await fs.readFile(sourceFile.filePath, { encoding: "utf8" });
                resultPromises.push(LinesOfCodeRawText.calculate(sourceCode)); // Should never throw
            } catch (error) {
                metricErrors.push({ metricName: FileMetric.linesOfCode, error });
            }
        }

        const resultsArray = await Promise.all(resultPromises);
        const metricResults = resultsArray.filter((result) => result !== null) as MetricResult[];

        return [sourceFile, { fileType: sourceFile.fileType, metricResults, metricErrors }];
    }
}
