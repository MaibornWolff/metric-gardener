import { findFilesAsync, formatPrintPath } from "./helper/Helper";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { CouplingResult, MetricResult, ParseFile } from "./metrics/Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Languages } from "./helper/Languages";

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
        console.time("Time to complete");

        const fileMetrics = new Map<string, Map<string, MetricResult>>();
        const unknownFiles: string[] = [];
        let couplingMetrics = {} as CouplingResult;

        try {
            const parseFilesGenerator = findFilesAsync(this.config);

            const fileMetricPromises: Promise<[string, Map<string, MetricResult>]>[] = [];
            const parseFiles: ParseFile[] = [];
            const unknownParseFiles: ParseFile[] = [];

            if (this.config.parseMetrics) {
                const metricsParser = new MetricCalculator(this.config);

                for await (const file of parseFilesGenerator) {
                    if (file.language !== Languages.Unknown) {
                        fileMetricPromises.push(metricsParser.calculateMetrics(file));
                        parseFiles.push(file);
                    } else {
                        unknownParseFiles.push(file);
                    }
                }
            }
            // In case this.config.parseMetrics is false, as we need all files for the coupling metrics:
            else {
                for await (const file of parseFilesGenerator) {
                    if (file.language !== Languages.Unknown) {
                        parseFiles.push(file);
                    } else {
                        unknownParseFiles.push(file);
                    }
                }
            }

            dlog(" --- " + parseFiles.length + " files detected", "\n\n");

            if (this.config.parseDependencies) {
                const couplingParser = new CouplingCalculator(this.config);
                couplingMetrics = couplingParser.calculateMetrics(parseFiles);
            }

            dlog("Final Coupling Metrics", couplingMetrics);

            // Await completion of file metric calculations:
            const promisesResults = await Promise.all(fileMetricPromises);
            for (const [filepath, metricsMap] of promisesResults) {
                fileMetrics.set(filepath, metricsMap);
            }

            for (const file of unknownParseFiles) {
                unknownFiles.push(formatPrintPath(file.filePath, this.config));
            }

            console.log("#####################################");
            console.log("#####################################");
            console.log("Metrics calculation finished.");
            console.timeEnd("Time to complete");

            return {
                fileMetrics,
                unknownFiles,
                couplingMetrics,
            };
        } catch (e) {
            console.error("#####################################");
            console.error("#####################################");
            console.error("Metrics calculation failed with the following error:");
            console.error(e);

            return {
                fileMetrics,
                unknownFiles,
                couplingMetrics,
            };
        }
    }
}
