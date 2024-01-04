import { McCabeComplexity } from "./metrics/McCabeComplexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import fs from "fs";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { CommentLines } from "./metrics/CommentLines";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { Metric, MetricResult, ParseFile } from "./metrics/Metric";
import nodeTypesConfig from "./config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class MetricCalculator {
    private readonly fileMetrics: Metric[] = [];
    private config: Configuration;

    constructor(configuration: Configuration) {
        this.config = configuration;
        const allNodeTypes: ExpressionMetricMapping[] =
            nodeTypesConfig as ExpressionMetricMapping[];

        this.fileMetrics = [
            new McCabeComplexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(allNodeTypes),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
        ];
    }

    calculateMetrics(parseFiles: ParseFile[]) {
        const sourcesRoot = fs.realpathSync(this.config.sourcesPath);

        dlog("\n\n", "----- Calculating metrics for " + sourcesRoot + " recursively -----", "\n\n");
        dlog(" --- " + parseFiles.length + " files detected", "\n\n");

        const fileMetrics = new Map<string, Map<string, MetricResult>>();

        for (const parseFile of parseFiles) {
            const metricResults = new Map<string, MetricResult>();
            fileMetrics.set(parseFile.filePath, metricResults);

            dlog(" ------------ Parsing File " + parseFile.filePath + ":  ------------ ");

            for (const metric of this.fileMetrics) {
                const metricResult = metric.calculate(parseFile);
                metricResults.set(metricResult.metricName, metricResult);
            }
        }

        return fileMetrics;
    }
}
