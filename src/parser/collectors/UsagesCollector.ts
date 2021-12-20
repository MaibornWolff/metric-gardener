import { Factory as UsageCollectorFactory } from "./usages/Factory";
import { UsageCandidate } from "./usages/AbstractCollector";
import { NamespaceCollector } from "./NamespaceCollector";
import { ParseFile } from "../metrics/Metric";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();

    getUsages(parseFile: ParseFile, namespaceCollector: NamespaceCollector): UsageCandidate[] {
        const collector = this.usageCollectorFactory.getCollector(parseFile);
        return collector !== undefined
            ? collector.getUsageCandidates(parseFile, namespaceCollector)
            : [];
    }
}
