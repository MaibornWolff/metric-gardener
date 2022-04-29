export class Configuration {
    sourcesPath: string;
    outputPath: string;
    parseMetrics: boolean;
    parseDependencies: boolean;
    exclusions: string[];
    compress: boolean;

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
