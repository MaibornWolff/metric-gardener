import { type ParsedFile } from "../metrics/Metric.js";
import { Factory as UsageCollectorFactory } from "./typeUsages/Factory.js";
import { type NamespaceCollector } from "./NamespaceCollector.js";
import {
    type TypeUsageCandidate,
    type UnresolvedCallExpression,
} from "./typeUsages/AbstractCollector.js";

export class UsagesCollector {
    private readonly usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(
        parsedFile: ParsedFile,
        namespaceCollector: NamespaceCollector,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector === undefined
            ? { candidates: [], unresolvedCallExpressions: [] }
            : collector.getUsageCandidates(parsedFile, namespaceCollector);
    }
}
