/**
 * Parameters of the constructor of {@link Configuration}.
 * Represents configuration options that can be provided by the user via command line arguments.
 */
export type ConfigurationParameters = {
    /**
     * Path to the source files to be parsed.
     */
    sourcesPath: string;
    /**
     * Path where the output file with the calculated metrics should be stored.
     */
    outputPath: string;
    /**
     * Whether dependencies should be analyzed.
     */
    parseDependencies: boolean;
    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    exclusions: string;
    /**
     * Whether to parse all .h files as C instead of C++.
     */
    parseAllHAsC: boolean;
    /**
     * Folders or file names for which .h files should be parsed as C instead of C++ files. Ignored if parseAllAsC is set.
     */
    parseSomeHAsC: string;
    /**
     * Whether to compress the output file with the calculated metrics in a zip archive.
     */
    compress: boolean;
    /**
     * Whether to include the relative file paths or absolute paths of the analyzed files in the output.
     */
    relativePaths: boolean;
};

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
    readonly parseDependencies: boolean;

    /**
     * Folders to exclude from being searched for files to be parsed.
     */
    readonly exclusions: Set<string>;

    /**
     * Whether to parse all .h files as C instead of C++.
     */
    readonly parseAllHAsC: boolean;

    /**
     * Folders or file names for which .h files should be parsed as C instead of C++ files.
     */
    readonly parseSomeHAsC: Set<string>;

    /**
     * Whether to compress the output file with the calculated metrics in a zip archive.
     */
    readonly compress: boolean;

    /**
     * Whether to include the relative file paths or absolute paths of the analyzed files in the output.
     */
    readonly relativePaths: boolean;

    /**
     * Constructs a new {@link Configuration} object by specifying the configuration options passed by the user
     * as command line arguments.
     * @param parameters {@link Parameters} object containing the configuration options.
     */
    constructor(parameters: ConfigurationParameters) {
        this.sourcesPath = parameters.sourcesPath;
        this.outputPath = parameters.outputPath;
        this.parseDependencies = parameters.parseDependencies;

        this.exclusions = new Set(
            parameters.exclusions.length > 0
                ? parameters.exclusions.split(",").map((exclusion) => exclusion.trim())
                : null,
        );

        this.parseAllHAsC = parameters.parseAllHAsC;

        this.parseSomeHAsC = new Set(
            !parameters.parseAllHAsC && parameters.parseSomeHAsC.length > 0
                ? parameters.parseSomeHAsC
                      .split(",")
                      .map((folderOrFileName) => folderOrFileName.trim())
                : null,
        );

        this.compress = parameters.compress;
        this.relativePaths = parameters.relativePaths;
    }
}
