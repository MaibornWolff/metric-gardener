import { Factory as UsageCollectorFactory } from "./typeUsages/Factory.js";
import { NamespaceCollector } from "./NamespaceCollector.js";
import { ParsedFile } from "../metrics/Metric.js";
import { TypeUsageCandidate, UnresolvedCallExpression } from "./typeUsages/AbstractCollector.js";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(
        parsedFile: ParsedFile,
        namespaceCollector: NamespaceCollector,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector !== undefined
            ? collector.getUsageCandidates(parsedFile, namespaceCollector)
            : { candidates: [], unresolvedCallExpressions: [] };
    }
}
