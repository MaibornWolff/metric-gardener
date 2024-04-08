import { Configuration } from "./Configuration.js";
import { Coupling } from "./metrics/coupling/Coupling.js";
import { NamespaceCollector } from "./resolver/NamespaceCollector.js";
import { UsagesCollector } from "./resolver/UsagesCollector.js";
import { CouplingMetric, CouplingResult, ParsedFile, SourceFile } from "./metrics/Metric.js";
import { PublicAccessorCollector } from "./resolver/PublicAccessorCollector.js";

export class CouplingCalculator {
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private readonly namespaceCollector: NamespaceCollector;
    private readonly publicAccessorCollector: PublicAccessorCollector;
    private readonly usageCollector: UsagesCollector;

    constructor(configuration: Configuration) {
        this.config = configuration;
        this.namespaceCollector = new NamespaceCollector();
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
        } else {
            return { relationships: [], metrics: new Map() };
        }
    }
}
