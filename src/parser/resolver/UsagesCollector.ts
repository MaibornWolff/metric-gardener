import { Factory as UsageCollectorFactory } from "./typeUsages/Factory.js";
import { NamespaceCollector } from "./NamespaceCollector.js";
import { ParsedFile } from "../metrics/Metric.js";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(parsedFile: ParsedFile, namespaceCollector: NamespaceCollector) {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector !== undefined
            ? collector.getUsageCandidates(parsedFile, namespaceCollector)
            : { candidates: [], unresolvedCallExpressions: [] };
    }
}
