export class Configuration {
    sourcesPath: string;
    outputPath: string;
    compress: boolean;

    constructor(sourcesPath: string, outputPath: string, compress: boolean) {
        this.sourcesPath = sourcesPath;
        this.outputPath = outputPath;
        this.compress = compress;
    }
}
