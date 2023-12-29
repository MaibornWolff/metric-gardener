import { grammars } from "./helper/Grammars";
import { findFilesAsync } from "./helper/Helper";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { CouplingResult, MetricResult, ParseFile } from "./metrics/Metric";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

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
        const startTime = performance.now();

        const parseFilesGenerator = findFilesAsync(
            this.config.sourcesPath,
            [...grammars.keys()],
            this.config.exclusions
        );

        const fileMetrics = new Map<string, Map<string, MetricResult>>();
        let generatorDone = false;
        let parseFiles: ParseFile[] = [];

        if (this.config.parseMetrics) {
            const metricsParser = new MetricCalculator(this.config);

            // Cannot use for await of here, because we need the return value for the dependency analysis.
            while (!generatorDone) {
                const generatorResult = await parseFilesGenerator.next();
                if (generatorResult.done) {
                    generatorDone = true;
                    parseFiles = generatorResult.value;
                } else {
                    const file = generatorResult.value;
                    fileMetrics.set(file.filePath, await metricsParser.calculateMetrics(file));
                }
            }
        }

        // In case this.config.parseMetrics is false:
        while (!generatorDone) {
            const generatorResult = await parseFilesGenerator.next();
            if (generatorResult.done) {
                generatorDone = true;
                parseFiles = generatorResult.value;
            }
        }

        dlog(" --- " + parseFiles.length + " files detected", "\n\n");

        let couplingMetrics = {} as CouplingResult;
        if (this.config.parseDependencies) {
            const couplingParser = new CouplingCalculator(this.config);
            couplingMetrics = couplingParser.calculateMetrics(parseFiles);
        }

        dlog("Final Coupling Metrics", couplingMetrics);

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log("\n\n");
        console.log("#####################################");
        console.log("#####################################");
        console.log("\n\n");
        console.log(
            `Parsing took ${duration / 1000} seconds or ${
                duration / 1000 / 60
            } minutes respectively`
        );

        return {
            fileMetrics,
            couplingMetrics,
        };
    }
}
