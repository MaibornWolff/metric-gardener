import { Factory as UsageCollectorFactory } from "./typeUsages/Factory";
import { NamespaceCollector } from "./NamespaceCollector";
import { ParseFile } from "../metrics/Metric";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(parseFile: ParseFile, namespaceCollector: NamespaceCollector) {
        const collector = this.usageCollectorFactory.getCollector(parseFile);
        return collector !== undefined
            ? collector.getUsageCandidates(parseFile, namespaceCollector)
            : { candidates: [], unresolvedCallExpressions: [] };
    }
}
