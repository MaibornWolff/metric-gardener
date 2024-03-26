import * as fs from "fs";
import { NodeTypeConfig } from "./helper/Model.js";
import { Configuration } from "./Configuration.js";
import { Coupling } from "./metrics/coupling/Coupling.js";
import { NamespaceCollector } from "./resolver/NamespaceCollector.js";
import { UsagesCollector } from "./resolver/UsagesCollector.js";
import { CouplingMetric, ParsedFile } from "./metrics/Metric.js";
import { PublicAccessorCollector } from "./resolver/PublicAccessorCollector.js";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class CouplingCalculator {
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private readonly namespaceCollector: NamespaceCollector;
    private readonly publicAccessorCollector: PublicAccessorCollector;
    private readonly usageCollector: UsagesCollector;

    constructor(configuration: Configuration) {
        this.config = configuration;

        const nodeTypesJson = fs
            .readFileSync(fs.realpathSync("./src/parser/config/nodeTypesConfig.json"))
            .toString();
        const allNodeTypes: NodeTypeConfig[] = JSON.parse(nodeTypesJson);

        this.namespaceCollector = new NamespaceCollector();
        this.publicAccessorCollector = new PublicAccessorCollector();
        this.usageCollector = new UsagesCollector();

        this.comprisingMetrics = [
            new Coupling(
                this.config,
                allNodeTypes,
                this.namespaceCollector,
                this.usageCollector,
                this.publicAccessorCollector,
            ),
        ];
    }

    calculateMetrics(parsedFiles: ParsedFile[]) {
        const sourcesRoot = this.config.sourcesPath;

        dlog("\n\n");
        dlog("----- Parsing Coupling of files in " + sourcesRoot + " recursively -----");
        dlog("\n\n");

        dlog(" --- " + parsedFiles.length + " files detected", "\n\n");

        // TODO rewrite this to support multiple coupling metrics
        return this.comprisingMetrics[0].calculate(parsedFiles);
    }
}
