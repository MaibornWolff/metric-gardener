export class Configuration {
    sourcesPath: string;
    outputPath: string;
    exclusions: string[];
    compress: boolean;
    parseMetrics: boolean;
    parseDependencies: boolean;
    persistDependencyGraph: boolean;

    private defaultExclusions = ["node_modules", ".idea", "dist", "build", "out", "vendor"];

    constructor(sourcesPath: string, outputPath: string, exclusions: string[], compress: boolean) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.exclusions = this.defaultExclusions;
        this.compress = compress;
        this.parseMetrics = false;
        this.parseDependencies = true;
        this.persistDependencyGraph = true;
    }
}
