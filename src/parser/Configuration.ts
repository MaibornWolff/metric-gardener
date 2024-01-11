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
     * Constructs a new {@link Configuration} object by specifying the files to be parsed
     * and the metrics to be calculated.
     * @param sourcesPath Path to the source files to be parsed.
     * @param outputPath Path where the output file with the calculated metrics should be stored.
     * @param parseDependencies Whether dependencies should be analyzed.
     * @param exclusions Folders to exclude from being searched for files to be parsed.
     * @param compress Whether to compress the output file with the calculated metrics in a zip archive.
     */
    constructor(
        sourcesPath: string,
        outputPath: string,
        parseDependencies: boolean,
        exclusions: string,
        compress: boolean
    ) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.parseMetrics = true;
        this.parseDependencies = parseDependencies;
        this.exclusions = exclusions.split(",").map((exclusion) => exclusion.trim());
        this.compress = compress;
    }
}
