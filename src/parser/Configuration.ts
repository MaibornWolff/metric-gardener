/**
 * Configures the files to be parsed and the metrics to be calculated.
 */
export class Configuration {
    /**
     * Resolved, absolute path to the source files to be parsed.
     */
    sourcesPath: string;

    /**
     * Path where the output file with the calculated metrics should be stored.
     */
    outputPath: string;

    /**
     * Whether dependencies should be analyzed.
     */
    parseMetrics: boolean;

    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    parseDependencies: boolean;

    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    exclusions: string[];

    /**
     * Whether to compress the output file with the calculated metrics in a zip archive.
     */
    compress: boolean;

    /**
     * Whether to include the relative file paths or absolute paths of the analyzed files in the output.
     */
    relativePaths: boolean;

    /**
     * Whether to replace all forward slashes in file paths by backward slashes in the output.
     * For platform-independent testing purposes only.
     */
    enforceBackwardSlash: boolean;

    /**
     * Constructs a new {@link Configuration} object by specifying the files to be parsed
     * and the metrics to be calculated.
     * @param sourcesPath Path to the source files to be parsed.
     * @param outputPath Path where the output file with the calculated metrics should be stored.
     * @param parseDependencies Whether dependencies should be analyzed.
     * @param exclusions Folders to exclude from being searched for files to be parsed.
     * @param compress Whether to compress the output file with the calculated metrics in a zip archive.
     * @param relativePaths Whether to include the relative file paths or absolute paths
     * @param enforceBackwardSlash Whether to replace all forward slashes in file paths by backward slashes in the output.
     * For platform-independent testing purposes only.
     * of the analyzed files in the output.
     */
    constructor(
        sourcesPath: string,
        outputPath: string,
        parseDependencies: boolean,
        exclusions: string,
        compress: boolean,
        relativePaths: boolean,
        enforceBackwardSlash = false
    ) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.parseMetrics = true;
        this.parseDependencies = parseDependencies;
        this.exclusions = exclusions.split(",").map((exclusion) => exclusion.trim());
        this.compress = compress;
        this.relativePaths = relativePaths;
        this.enforceBackwardSlash = enforceBackwardSlash;
    }

    /**
     * Checks if there is a need to format the file paths with {@link formatPrintPath} before outputting them.
     * @return Whether there is a need to format the file paths.
     */
    needsPrintPathFormatting(): boolean {
        return this.relativePaths || this.enforceBackwardSlash;
    }
}
