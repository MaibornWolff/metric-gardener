import fs from "fs";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { Coupling } from "./metrics/coupling/Coupling";
import { NamespaceCollector } from "./resolver/NamespaceCollector";
import { UsagesCollector } from "./resolver/UsagesCollector";
import { CouplingMetric, ParseFile } from "./metrics/Metric";
import { PublicAccessorCollector } from "./resolver/PublicAccessorCollector";
import { debuglog } from "node:util";

const dlog = debuglog("metric-gardener");

export class CouplingCalculator {
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private readonly namespaceCollector: NamespaceCollector;
    private readonly publicAccessorCollector: PublicAccessorCollector;
    private readonly usageCollector: UsagesCollector;

    constructor(configuration: Configuration) {
        this.config = configuration;

        const nodeTypesJson = fs
            .readFileSync(fs.realpathSync("./resources/node-types-mapped.config"))
            .toString();
        const allNodeTypes: ExpressionMetricMapping[] = JSON.parse(nodeTypesJson);

        this.namespaceCollector = new NamespaceCollector();
        this.publicAccessorCollector = new PublicAccessorCollector();
        this.usageCollector = new UsagesCollector();

        this.comprisingMetrics = [
            new Coupling(
                allNodeTypes,
                this.namespaceCollector,
                this.usageCollector,
                this.publicAccessorCollector
            ),
        ];
    }

    calculateMetrics(parseFiles: ParseFile[]) {
        const sourcesRoot = fs.realpathSync(this.config.sourcesPath);

        dlog("\n\n");
        dlog("----- Parsing Coupling of files in " + sourcesRoot + " recursively -----");
        dlog("\n\n");

        dlog(" --- " + parseFiles.length + " files detected", "\n\n");

        // TODO rewrite this to support multiple coupling metrics
        return this.comprisingMetrics[0].calculate(parseFiles);
    }
}
