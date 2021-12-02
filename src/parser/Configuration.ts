export class Configuration {
    sourcesPath: string;
    outputPath: string;
    parseMetrics: boolean;
    parseDependencies: boolean;
    persistDependencyGraph: boolean;
    eraseFromPath: string;
    exclusions: string[];
    compress: boolean;

    private defaultExclusions = ["node_modules", ".idea", "dist", "build", "out", "vendor"];

    constructor(
        sourcesPath: string,
        outputPath: string,
        parseDependencies: boolean,
        eraseFromPath: string | null,
        exclusions: string[],
        compress: boolean
    ) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.parseMetrics = true;
        this.parseDependencies = parseDependencies;
        this.persistDependencyGraph = parseDependencies;
        this.eraseFromPath = eraseFromPath;
        this.exclusions = this.defaultExclusions;
        this.compress = compress;
    }
}
