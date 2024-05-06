import { type Configuration } from "./configuration.js";
import { Coupling } from "./metrics/coupling/coupling.js";
import { FqtnCollector } from "./resolver/fqtn-collector.js";
import { UsagesCollector } from "./resolver/usages-collector.js";
import {
    type CouplingMetric,
    type CouplingResult,
    ParsedFile,
    type SourceFile,
} from "./metrics/metric.js";
import { PublicAccessorCollector } from "./resolver/public-accessor-collector.js";

export class CouplingCalculator {
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private readonly config: Configuration;

    private readonly namespaceCollector: FqtnCollector;
    private readonly publicAccessorCollector: PublicAccessorCollector;
    private readonly usageCollector: UsagesCollector;

    constructor(configuration: Configuration) {
        this.config = configuration;
        this.namespaceCollector = new FqtnCollector();
        this.publicAccessorCollector = new PublicAccessorCollector();
        this.usageCollector = new UsagesCollector();
        this.comprisingMetrics = [
            new Coupling(
                this.config,
                this.namespaceCollector,
                this.usageCollector,
                this.publicAccessorCollector,
            ),
        ];
    }

    processFile(sourceFile: SourceFile): void {
        if (this.config.parseDependencies && sourceFile instanceof ParsedFile) {
            this.comprisingMetrics[0].processFile(sourceFile);
        }
    }

    calculateMetrics(): CouplingResult {
        if (this.config.parseDependencies) {
            console.log("Calculating coupling metrics...");
            // TODO rewrite this to support multiple coupling metrics
            return this.comprisingMetrics[0].calculate();
        }

        return { relationships: [], metrics: new Map() };
    }
}
