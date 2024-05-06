import { type ParsedFile } from "../metrics/metric.js";
import { Factory as UsageCollectorFactory } from "./type-usages/factory.js";
import { type FqtnCollector } from "./fqtn-collector.js";
import {
    type TypeUsageCandidate,
    type UnresolvedCallExpression,
} from "./type-usages/abstract-collector.js";

export class UsagesCollector {
    private readonly usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(
        parsedFile: ParsedFile,
        FQTNCollector: FqtnCollector,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector === undefined
            ? { candidates: [], unresolvedCallExpressions: [] }
            : collector.getUsageCandidates(parsedFile, FQTNCollector);
    }
}
