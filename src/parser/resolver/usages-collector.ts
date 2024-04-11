import { type ParsedFile } from "../metrics/metric.js";
import { Factory as UsageCollectorFactory } from "./type-usages/factory.js";
import { type NamespaceCollector } from "./namespace-collector.js";
import {
    type TypeUsageCandidate,
    type UnresolvedCallExpression,
} from "./type-usages/abstract-collector.js";

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
