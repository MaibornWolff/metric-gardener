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
    ErrorFile,
    isErrorFile,
} from "./metrics/Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { TreeParser } from "./helper/TreeParser";
import { FileType } from "./helper/Language";

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
        const errorFiles = new Map<string, Error>();
        let couplingMetrics = {} as CouplingResult;

        try {
            const filePathGenerator = findFilesAsync(this.config);
            const parsePromises = new Map<string, Promise<SourceFile>>();

            for await (const filePath of filePathGenerator) {
                parsePromises.set(
                    filePath,
                    TreeParser.parse(filePath, this.config).catch((reason) => {
                        console.error("Error while parsing a tree for the file " + filePath);
                        console.error(reason);
                        return new ErrorFile(filePath, reason);
                    }),
                );
            }

            const fileMetricPromises: Promise<[SourceFile, FileMetricResults]>[] = [];

            if (this.config.parseMetrics) {
                const metricsParser = new MetricCalculator();

                for (const [filePath, parsePromise] of parsePromises) {
                    fileMetricPromises.push(
                        metricsParser.calculateMetrics(parsePromise).catch((reason) => {
                            console.error("Error while parsing file metrics");
                            console.error(reason);
                            return [
                                new ErrorFile(filePath, reason),
                                {
                                    fileType: FileType.Error,
                                    metricResults: new Map(),
                                },
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
                if (isParsedFile(file)) {
                    filesForCouplingMetrics.push(file);
                } else if (!isErrorFile(file)) {
                    unsupportedFiles.push(formatPrintPath(file.filePath, this.config));
                }
                // Error files are added at the end of the promise chain,
                // together with errors that occurred at a later stage (in metricsParser.calculateMetrics).
            }

            dlog(" --- " + treeParseResults.length + " files detected", "\n\n");

            if (this.config.parseDependencies) {
                const couplingParser = new CouplingCalculator(this.config);
                couplingMetrics = couplingParser.calculateMetrics(filesForCouplingMetrics);
            }

            dlog("Final Coupling Metrics", couplingMetrics);

            // Await completion of file metric calculations:
            const promisesResults = await Promise.all(fileMetricPromises);

            for (const [sourceFile, fileMetricResults] of promisesResults) {
                const printPath = formatPrintPath(sourceFile.filePath, this.config);
                if (isErrorFile(sourceFile)) {
                    // Error while parsing the syntax tree
                    errorFiles.set(printPath, sourceFile.error);
                } else {
                    fileMetrics.set(printPath, fileMetricResults);
                    if (fileMetricResults.error !== undefined) {
                        // Error while calculating (some) metrics on the syntax tree
                        errorFiles.set(printPath, fileMetricResults.error);
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
