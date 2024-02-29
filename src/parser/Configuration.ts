/**
 * Configures the files to be parsed and the metrics to be calculated.
 */
export class Configuration {
    /**
     * Resolved, absolute path to the source files to be parsed.
     */
    readonly sourcesPath: string;

    /**
     * Path where the output file with the calculated metrics should be stored.
     */
    readonly outputPath: string;

    /**
     * Whether dependencies should be analyzed.
     */
    readonly parseMetrics: boolean;

    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    readonly parseDependencies: boolean;

    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    readonly exclusions: Set<string>;

    /**
     * Whether to parse all .h files as C instead of C++.
     */
    readonly parseAllAsC: boolean;

    /**
     * Folders or file names for which .h files should be parsed as C instead of C++ files.
     */
    readonly parseSomeAsC: Set<string>;

    /**
     * Whether to compress the output file with the calculated metrics in a zip archive.
     */
    readonly compress: boolean;

    /**
     * Whether to include the relative file paths or absolute paths of the analyzed files in the output.
     */
    readonly relativePaths: boolean;

    /**
     * Whether to replace all forward slashes in file paths by backward slashes in the output.
     * For platform-independent testing purposes only.
     */
    readonly enforceBackwardSlash: boolean;

    /**
     * Constructs a new {@link Configuration} object by specifying the files to be parsed
     * and the metrics to be calculated.
     * @param sourcesPath Path to the source files to be parsed.
     * @param outputPath Path where the output file with the calculated metrics should be stored.
     * @param parseDependencies Whether dependencies should be analyzed.
     * @param exclusions Folders to exclude from being searched for files to be parsed.
     * @param parseAllAsC Whether to parse all .h files as C instead of C++.
     * @param parseSomeAsC Folders or file names for which .h files should be parsed as C instead of C++ files. Ignored if parseAllAsC is set.
     * @param compress Whether to compress the output file with the calculated metrics in a zip archive.
     * @param relativePaths Whether to include the relative file paths or absolute paths of the analyzed files in the output.
     * @param enforceBackwardSlash Whether to replace all forward slashes in file paths by backward slashes in the output.
     * For platform-independent testing purposes only.
     */
    constructor(
        sourcesPath: string,
        outputPath: string,
        parseDependencies: boolean,
        exclusions: string,
        parseAllAsC: boolean,
        parseSomeAsC: string,
        compress: boolean,
        relativePaths: boolean,
        enforceBackwardSlash = false,
    ) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.parseMetrics = true;
        this.parseDependencies = parseDependencies;

        if (exclusions.length > 0) {
            this.exclusions = new Set(exclusions.split(",").map((exclusion) => exclusion.trim()));
        } else {
            this.exclusions = new Set();
        }

        this.parseAllAsC = parseAllAsC;

        if (!parseAllAsC && parseSomeAsC.length > 0) {
            this.parseSomeAsC = new Set(
                parseSomeAsC.split(",").map((folderOrFileName) => folderOrFileName.trim()),
            );
        } else {
            this.parseSomeAsC = new Set();
        }

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
