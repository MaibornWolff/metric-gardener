import { grammars } from "./helper/Grammars";
import { findFilesRecursively } from "./helper/Helper";
import fs from "fs";
import { Configuration } from "./Configuration";
import { MetricsParser } from "./MetricsParser";
import { CouplingParser } from "./CouplingParser";

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
            ["node_modules", ".idea", "dist", "build", "out", "vendor"],
            []
        );

        console.log(" --- " + parseFiles.length + " files detected", "\n\n");

        let fileMetrics = new Map<string, Map<string, MetricResult>>();
        if (this.config.parseMetrics) {
            const metricsParser = new MetricsParser(this.config);
            fileMetrics = metricsParser.calculateMetrics(parseFiles);
        }

        let couplingMetrics = {} as CouplingMetricResult;
        if (this.config.parseDependencies) {
            const couplingParser = new CouplingParser(this.config);
            couplingMetrics = couplingParser.calculateMetrics(parseFiles);
        }

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
        console.log("\n\n", fileMetrics.size + " file(s) parsed successfully.", "\n\n");

        return {
            fileMetrics,
            couplingMetrics,
        };
    }
}
