import { findFilesAsync, formatPrintPath } from "./helper/Helper";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import {
    SourceFile,
    CouplingResult,
    isParsedFile,
    MetricResult,
    ParsedFile,
} from "./metrics/Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { TreeParser } from "./helper/TreeParser";

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
        const fileMetrics = new Map<string, Map<string, MetricResult>>();
        const unsupportedFiles: string[] = [];
        let couplingMetrics = {} as CouplingResult;

        try {
            const filePathGenerator = findFilesAsync(this.config);
            const parsePromises = new Map<string, Promise<SourceFile | null>>();

            for await (const filePath of filePathGenerator) {
                parsePromises.set(
                    filePath,
                    TreeParser.parse(filePath, this.config).catch((reason) => {
                        console.error("Error while parsing a tree for the file " + filePath);
                        console.error(reason);
                        return null;
                    }),
                );
            }

            const fileMetricPromises: Promise<[string, Map<string, MetricResult>]>[] = [];

            if (this.config.parseMetrics) {
                const metricsParser = new MetricCalculator(this.config);

                for (const [filePath, parsePromise] of parsePromises) {
                    fileMetricPromises.push(
                        metricsParser.calculateMetrics(parsePromise).catch((reason) => {
                            console.error("Error while parsing file metrics");
                            console.error(reason);
                            return [
                                filePath,
                                new Map([["ERROR", { metricName: "ERROR", metricValue: -1 }]]),
                            ];
                        }),
                    );
                }
            }

            // We need to ensure that all trees have been parsed before calculating the coupling metrics,
            // as we need to know the language of the file for that:
            const filesForCouplingMetrics: ParsedFile[] = [];
            const treeParseResults = await Promise.all(parsePromises.values());

            for (const file of treeParseResults) {
                // Do not try to parse the syntax tree of the file for the coupling metrics
                // if that file is unsupported or if parsing already failed once:
                if (file !== null) {
                    if (isParsedFile(file)) {
                        filesForCouplingMetrics.push(file);
                    } else {
                        unsupportedFiles.push(file.filePath);
                    }
                }
            }

            dlog(
                " --- " + (treeParseResults.length + unsupportedFiles.length) + " files detected",
                "\n\n",
            );

            if (this.config.parseDependencies) {
                const couplingParser = new CouplingCalculator(this.config);
                couplingMetrics = couplingParser.calculateMetrics(filesForCouplingMetrics);
            }

            dlog("Final Coupling Metrics", couplingMetrics);

            // Await completion of file metric calculations:
            const promisesResults = await Promise.all(fileMetricPromises);
            for (const [filepath, metricsMap] of promisesResults) {
                fileMetrics.set(filepath, metricsMap);
            }

            for (let i = 0; i < unsupportedFiles.length; i++) {
                unsupportedFiles[i] = formatPrintPath(unsupportedFiles[i], this.config);
            }

            return {
                fileMetrics,
                unsupportedFiles,
                couplingMetrics,
            };
        } catch (e) {
            console.error("#####################################");
            console.error("#####################################");
            console.error("Metrics calculation failed with the following error:");
            console.error(e);

            return {
                fileMetrics,
                unsupportedFiles,
                couplingMetrics,
            };
        }
    }
}
