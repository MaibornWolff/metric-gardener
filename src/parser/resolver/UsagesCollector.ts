import { Factory as UsageCollectorFactory } from "./typeUsages/Factory";
import { NamespaceCollector } from "./NamespaceCollector";
import { ParsedFile } from "../metrics/Metric";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(parsedFile: ParsedFile, namespaceCollector: NamespaceCollector) {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector !== undefined
            ? collector.getUsageCandidates(parsedFile, namespaceCollector)
            : { candidates: [], unresolvedCallExpressions: [] };
    }
}
