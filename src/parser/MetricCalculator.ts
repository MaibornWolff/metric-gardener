import { Complexity } from "./metrics/Complexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { CommentLines } from "./metrics/CommentLines";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { isParsedFile, Metric, MetricResult, SourceFile } from "./metrics/Metric";
import nodeTypesConfig from "./config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";
import { formatPrintPath } from "./helper/Helper";
import { NestingLevel } from "./metrics/NestingLevel";
import { LinesOfCodeRawText } from "./metrics/LinesOfCodeRawText";
import fs from "fs";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Arranges the calculation of all basic single file metrics on multiple files.
 */
export class MetricCalculator {
    readonly #fileMetrics: Metric[] = [];
    readonly #config: Configuration;

    /**
     * Constructs a new instance of {@link MetricCalculator} for arranging the calculation of all
     * basic single file metrics on multiple files.
     * @param configuration Configuration that should be applied for this new instance.
     */
    constructor(configuration: Configuration) {
        this.#config = configuration;
        const allNodeTypes: ExpressionMetricMapping[] =
            nodeTypesConfig as ExpressionMetricMapping[];

        this.#fileMetrics = [
            new Complexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
            new NestingLevel(allNodeTypes),
        ];
    }

    /**
     * Calculates all basic single file metrics on the specified file.
     * @param parsedFilePromise Promise for a parsed file for which the metric should be calculated.
     * @return A tuple that contains the path of the file and a Map
     * that relates each metric name to the calculated metric.
     */
    async calculateMetrics(
        parsedFilePromise: Promise<SourceFile | null>,
    ): Promise<[string, Map<string, MetricResult>]> {
        const sourceFile = await parsedFilePromise;

        if (sourceFile === null) {
            throw new Error(
                "Unable to calculate file metrics because there was an error while creating the tree.",
            );
        }
        const metricResults = new Map<string, MetricResult>();
        const resultPromises: Promise<MetricResult>[] = [];

        if (isParsedFile(sourceFile)) {
            dlog(
                " ------------ Parsing file metrics for file " +
                    sourceFile.filePath +
                    ":  ------------ ",
            );

            for (const metric of this.#fileMetrics) {
                resultPromises.push(
                    metric.calculate(sourceFile).catch((reason) => {
                        console.error("Error while calculating metric");
                        console.error(reason);
                        return { metricName: "ERROR", metricValue: -1 };
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
        for (const result of resultsArray) {
            metricResults.set(result.metricName, result);
        }

        return [formatPrintPath(sourceFile.filePath, this.#config), metricResults];
    }
}
