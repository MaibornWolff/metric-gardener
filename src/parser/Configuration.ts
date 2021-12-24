export class Configuration {
    sourcesPath: string;
    outputPath: string;
    parseMetrics: boolean;
    parseDependencies: boolean;
    persistDependencyGraph: boolean;
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
        this.parseMetrics = false;
        this.parseDependencies = parseDependencies;
        this.persistDependencyGraph = false;
        this.exclusions = exclusions.split(",").map((exclusion) => exclusion.trim());
        this.compress = compress;
    }
}
