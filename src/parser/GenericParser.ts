import { findFilesAsync, formatPrintPath } from "./helper/Helper";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import {
    SourceFile,
    CouplingResult,
    isParsedFile,
    ParsedFile,
    FileMetricResults,
    isErrorFile,
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
        const fileMetrics = new Map<string, FileMetricResults>();
        const unsupportedFiles: string[] = [];
        const errorFiles: string[] = [];
        let couplingMetrics = {} as CouplingResult;

        try {
            const filePathGenerator = findFilesAsync(this.config);
            const parsePromises = new Map<string, Promise<SourceFile>>();

            for await (const filePath of filePathGenerator) {
                parsePromises.set(filePath, TreeParser.parse(filePath, this.config));
            }

            const fileMetricPromises: Promise<[SourceFile, FileMetricResults]>[] = [];

            if (this.config.parseMetrics) {
                const metricsParser = new MetricCalculator();

                for (const [filePath, parsePromise] of parsePromises) {
                    fileMetricPromises.push(metricsParser.calculateMetrics(parsePromise));
                }
            }

            // We need to ensure that all trees have been parsed before calculating the coupling metrics,
            // as we need to know the language of the file for that:
            const treeParseResults = await Promise.all(parsePromises.values());

            dlog(" --- " + treeParseResults.length + " files detected", "\n\n");

            const filesForCouplingMetrics: ParsedFile[] = [];

            for (const sourceFile of treeParseResults) {
                if (isErrorFile(sourceFile)) {
                    const printPath = formatPrintPath(sourceFile.filePath, this.config);
                    errorFiles.push(printPath);

                    console.error("Error while parsing the syntax tree for the file " + printPath);
                    console.error(sourceFile.error);
                } else if (isParsedFile(sourceFile)) {
                    // Do only include files for calculating the coupling metrics
                    // that are supported and have been parsed successfully:
                    filesForCouplingMetrics.push(sourceFile);
                }
            }

            if (this.config.parseDependencies) {
                const couplingParser = new CouplingCalculator(this.config);
                couplingMetrics = couplingParser.calculateMetrics(filesForCouplingMetrics);
            }

            dlog("Final Coupling Metrics", couplingMetrics);

            // Await completion of file metric calculations:
            const promisesResults = await Promise.all(fileMetricPromises);

            for (const [sourceFile, fileMetricResults] of promisesResults) {
                const printPath = formatPrintPath(sourceFile.filePath, this.config);
                if (!isErrorFile(sourceFile)) {
                    fileMetrics.set(printPath, fileMetricResults);

                    // Inform about errors that occurred while calculating (some) metrics on the syntax tree
                    for (const metricError of fileMetricResults.metricErrors.values()) {
                        console.error(
                            "Error while calculating the metric " +
                                metricError.metricName +
                                " on the file " +
                                sourceFile.filePath,
                        );
                        console.error(metricError.error);
                    }
                    if (!isParsedFile(sourceFile)) {
                        unsupportedFiles.push(formatPrintPath(sourceFile.filePath, this.config));
                    }
                }
            }

            return {
                fileMetrics,
                unsupportedFiles,
                errorFiles,
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
                errorFiles,
                couplingMetrics,
            };
        }
    }
}
