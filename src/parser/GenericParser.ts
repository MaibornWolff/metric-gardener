import { grammars } from "./helper/Grammars";
import { findFilesRecursively } from "./helper/Helper";
import fs from "fs";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { CouplingResult, MetricResult } from "./metrics/Metric";
import { debuglog } from "node:util";

const dlog = debuglog("metric-gardener");

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
    calculateMetrics() {
        const startTime = performance.now();

        const parseFiles = findFilesRecursively(
            fs.realpathSync(this.config.sourcesPath),
            [...grammars.keys()],
            this.config.exclusions,
            []
        );

        dlog(" --- " + parseFiles.length + " files detected\n\n");

        let fileMetrics = new Map<string, Map<string, MetricResult>>();
        if (this.config.parseMetrics) {
            const metricsParser = new MetricCalculator(this.config);
            fileMetrics = metricsParser.calculateMetrics(parseFiles);
        }

        let couplingMetrics = {} as CouplingResult;
        if (this.config.parseDependencies) {
            const couplingParser = new CouplingCalculator(this.config);
            couplingMetrics = couplingParser.calculateMetrics(parseFiles);
        }

        console.log("Final Coupling Metrics", couplingMetrics);

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
