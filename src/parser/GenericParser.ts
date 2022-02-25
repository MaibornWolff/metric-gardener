import { grammars } from "./helper/Grammars";
import { findFilesRecursively } from "./helper/Helper";
import fs from "fs";
import { Configuration } from "./Configuration";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { CouplingResult, MetricResult } from "./metrics/Metric";

export class GenericParser {
    private readonly config: Configuration;

    constructor(configuration: Configuration) {
        this.config = configuration;
    }

    calculateMetrics() {
        const startTime = performance.now();

        const parseFiles = findFilesRecursively(
            fs.realpathSync(this.config.sourcesPath),
            [...grammars.keys()],
            this.config.exclusions,
            []
        );

        console.log(" --- " + parseFiles.length + " files detected", "\n\n");

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
