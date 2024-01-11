import { findFilesAsync } from "./helper/Helper";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { CouplingResult, MetricResult, ParseFile } from "./metrics/Metric";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Arranges the parsing of files and calculation of metrics as specified by the stored configuration.
 */
export class GenericParser {
    /**
     * Configuration according to which files are parsed and metrics are calculated.
     * @private
     */
    private readonly config: Configuration;

    /**
     * Constructs a new {@link GenericParser} object with the supplied configuration applied
     * (see also {@link Configuration}).
     * @param configuration The configuration to apply for the new {@link GenericParser} object.
     */
    constructor(configuration: Configuration) {
        this.config = configuration;
    }

    /**
     * Parses files and calculates metrics as specified by the configuration of this {@link GenericParser} object.
     */
    async calculateMetrics() {
        const startTime = performance.now();

        const parseFilesGenerator = findFilesAsync(this.config);

        const fileMetricPromises: Promise<[string, Map<string, MetricResult>]>[] = [];
        const parseFiles: ParseFile[] = [];

        if (this.config.parseMetrics) {
            const metricsParser = new MetricCalculator(this.config);

            for await (const file of parseFilesGenerator) {
                fileMetricPromises.push(metricsParser.calculateMetrics(file));
                parseFiles.push(file);
            }
        }
        // In case this.config.parseMetrics is false, as we need all files for the coupling metrics:
        else {
            for await (const file of parseFilesGenerator) {
                parseFiles.push(file);
            }
        }

        dlog(" --- " + parseFiles.length + " files detected", "\n\n");

        let couplingMetrics = {} as CouplingResult;
        if (this.config.parseDependencies) {
            const couplingParser = new CouplingCalculator(this.config);
            couplingMetrics = couplingParser.calculateMetrics(parseFiles);
        }

        dlog("Final Coupling Metrics", couplingMetrics);

        // Await completion of file metric calculations:
        const fileMetrics = new Map<string, Map<string, MetricResult>>();
        const promisesResults = await Promise.all(fileMetricPromises);
        for (const [filepath, metricsMap] of promisesResults) {
            fileMetrics.set(filepath, metricsMap);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const durationSeconds = duration / 1000;

        console.log("\n");
        console.log("#####################################");
        console.log("#####################################");
        console.log(
            `Parsing took ${durationSeconds} seconds\nor ${Math.floor(
                durationSeconds / 60
            )} minutes and ${durationSeconds % 60} seconds respectively\n`
        );

        return {
            fileMetrics,
            couplingMetrics,
        };
    }
}
