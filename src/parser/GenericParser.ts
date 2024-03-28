import { findFilesAsync, formatPrintPath } from "./helper/Helper.js";
import { Configuration } from "./Configuration.js";
import { calculateMetrics } from "./MetricCalculator.js";
import { CouplingCalculator } from "./CouplingCalculator.js";
import { SourceFile, FileMetricResults, ErrorFile, UnsupportedFile } from "./metrics/Metric.js";
import { TreeParser } from "./helper/TreeParser.js";
import pMap from "p-map";

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
        const filePaths = await this.loadFilePaths();

        const couplingParser = new CouplingCalculator(this.config);

        let parsed = 0;
        const results = await pMap(
            filePaths,
            async (filePath) => {
                const sourceFile = await TreeParser.parse(filePath, this.config);
                couplingParser.processFile(sourceFile);

                const progress = Math.floor((parsed++ / filePaths.length) * 100);
                showProgressBar(progress);

                return calculateMetrics(sourceFile);
            },
            { concurrency: 10 },
        );
        clearProgressBar();

        const couplingMetrics = couplingParser.calculateMetrics();
        return { ...this.processResults(results), couplingMetrics };
    }

    private async loadFilePaths(): Promise<string[]> {
        const filePaths: string[] = [];

        for await (const filePath of findFilesAsync(this.config)) {
            filePaths.push(filePath);
            if (filePaths.length % 1000 === 0) {
                process.stdout.write(`\rfiles: ${filePaths.length}`);
            }
        }
        console.log(`\rfiles: ${filePaths.length}`);

        return filePaths;
    }

    private processResults(results: [SourceFile, FileMetricResults][]) {
        const fileMetrics = new Map<string, FileMetricResults>();
        const unsupportedFiles: string[] = [];
        const errorFiles: string[] = [];

        for (const [sourceFile, fileMetricResults] of results) {
            const printPath = formatPrintPath(sourceFile.filePath, this.config);

            if (sourceFile instanceof ErrorFile) {
                errorFiles.push(printPath);
                console.error("Error while parsing the syntax tree for the file " + printPath);
                console.error(sourceFile.error);
            } else {
                fileMetrics.set(printPath, fileMetricResults);

                // Inform about errors that occurred while calculating (some) metrics on the syntax tree
                for (const metricError of fileMetricResults.metricErrors) {
                    console.error(
                        "Error while calculating the metric " +
                            metricError.metricName +
                            " on the file " +
                            sourceFile.filePath,
                    );
                    console.error(metricError.error);
                }

                if (sourceFile instanceof UnsupportedFile) {
                    unsupportedFiles.push(printPath);
                }
            }
        }

        return {
            fileMetrics,
            unsupportedFiles,
            errorFiles,
        };
    }
}

let progress = 0;
function showProgressBar(i: number) {
    if (i > progress) {
        progress = i;
        const dots = ".".repeat(i);
        const left = 100 - i;
        const empty = " ".repeat(left);
        process.stdout.write(`\r[${dots}${empty}] ${i}%`);
    }
}
function clearProgressBar() {
    process.stdout.write("\r" + " ".repeat(110) + "\r");
    progress = 0;
}
