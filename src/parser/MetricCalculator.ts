import { Complexity } from "./metrics/Complexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { CommentLines } from "./metrics/CommentLines";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { Metric, MetricResult, ParseFile } from "./metrics/Metric";
import nodeTypesConfig from "./config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";
import { formatPrintPath } from "./helper/Helper";
import { TreeParser } from "./helper/TreeParser";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Arranges the calculation of all basic single file metrics on multiple files.
 */
export class MetricCalculator {
    private readonly fileMetrics: Metric[] = [];
    private config: Configuration;

    /**
     * Constructs a new instance of {@link MetricCalculator} for arranging the calculation of all
     * basic single file metrics on multiple files.
     * @param configuration Configuration that should be applied for this new instance.
     */
    constructor(configuration: Configuration) {
        this.config = configuration;
        const allNodeTypes: ExpressionMetricMapping[] =
            nodeTypesConfig as ExpressionMetricMapping[];

        this.fileMetrics = [
            new Complexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
        ];
    }

    /**
     * Calculates all basic single file metrics on the specified file.
     * @param parseFile File for which the metric should be calculated.
     * @return A tuple that contains the path of the file and a Map
     * that relates each metric name to the calculated metric.
     */
    async calculateMetrics(parseFile: ParseFile): Promise<[string, Map<string, MetricResult>]> {
        try {
            const metricResults = new Map<string, MetricResult>();
            const resultPromises: Promise<MetricResult>[] = [];

            dlog(" ------------ Parsing File " + parseFile.filePath + ":  ------------ ");

            const tree = await TreeParser.getParseTreeAsync(parseFile);

            for (const metric of this.fileMetrics) {
                resultPromises.push(
                    metric.calculate(parseFile, tree).catch((reason) => {
                        console.error("Error while calculating metric");
                        console.error(reason);
                        return { metricName: "ERROR", metricValue: -1 };
                    })
                );
            }

            const resultsArray = await Promise.all(resultPromises);
            for (const result of resultsArray) {
                metricResults.set(result.metricName, result);
            }

            return [formatPrintPath(parseFile.filePath, this.config), metricResults];
        } catch (e) {
            console.error("Error while parsing file metrics");
            console.error(e);
            return [
                parseFile.filePath,
                new Map([["ERROR", { metricName: "ERROR", metricValue: -1 }]]),
            ];
        }
    }
}
