import { Factory as UsageCollectorFactory } from "./typeUsages/Factory";
import { NamespaceCollector } from "./NamespaceCollector";
import { ParsedFile } from "../metrics/Metric";
import { TypeUsageCandidate, UnresolvedCallExpression } from "./typeUsages/AbstractCollector";

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
