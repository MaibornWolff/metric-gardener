import { Complexity } from "./metrics/Complexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { CommentLines } from "./metrics/CommentLines";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { NodeTypeConfig } from "./helper/Model";
import { Configuration } from "./Configuration";
import {
    ErrorFile,
    FileMetricResults,
    isErrorFile,
    isParsedFile,
    Metric,
    MetricResult,
    SourceFile
} from "./metrics/Metric";
import nodeTypesConfig from "./config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";
import { formatPrintPath } from "./helper/Helper";
import { MaxNestingLevel } from "./metrics/MaxNestingLevel";

import { LinesOfCodeRawText } from "./metrics/LinesOfCodeRawText";
import fs from "fs";
import { FileType } from "./helper/Language";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Arranges the calculation of all basic single file metrics on multiple files.
 */
export class MetricCalculator {
    readonly #sourceFileMetrics: Metric[] = [];
    readonly #structuredTextFileMetrics: Metric[] = [];
    readonly #config: Configuration;

    /**
     * Constructs a new instance of {@link MetricCalculator} for arranging the calculation of all
     * basic single file metrics on multiple files.
     * @param configuration Configuration that should be applied for this new instance.
     */
    constructor(configuration: Configuration) {
        this.#config = configuration;
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
            return [sourceFile, {fileType: sourceFile.fileType, metricResults: new Map()}];
        }
        const metricResults = new Map<string, MetricResult>();
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
                        console.error("Error while calculating metric");
                        console.error(reason);
                        return null;
                    }),
                );
            }
        } else {
            // Unsupported file: only calculate metrics based on the raw source code
            const sourceCode = await fs.promises.readFile(sourceFile.filePath, {
                encoding: "utf8",
            });
            resultPromises.push(LinesOfCodeRawText.calculate(sourceCode));
        }

        const resultsArray = await Promise.all(resultPromises);
        let errorOccured = false;
        for (const result of resultsArray) {
            if(result !== null){
                metricResults.set(result.metricName, result);
            } else {
                errorOccured = true;
            }
        }

        if(!errorOccured){
            return [sourceFile, { fileType: sourceFile.fileType, metricResults }];
        } else {
            return [sourceFile,
                { fileType: sourceFile.fileType, metricResults, error: new Error("Error while calculating metric(s) for file " + sourceFile.filePath) }];
        }

    }
}
