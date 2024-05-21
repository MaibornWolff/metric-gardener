import { type ParsedFile } from "../metrics/metric.js";
import { Factory as UsageCollectorFactory } from "./call-expressions/factory.js";
import { type TypeCollector } from "./type-collector.js";
import {
    type TypeUsageCandidate,
    type UnresolvedCallExpression,
} from "./call-expressions/abstract-collector.js";
import type { TypeInfo } from "./types/abstract-collector.js";

export class UsagesCollector {
    private readonly usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(
        parsedFile: ParsedFile,
        typesFromFile: Map<FQTN, TypeInfo>,
    ): {
        candidates: TypeUsageCandidate[];
        unresolvedCallExpressions: UnresolvedCallExpression[];
    } {
        const collector = this.usageCollectorFactory.getCollector(parsedFile);
        return collector === undefined
            ? { candidates: [], unresolvedCallExpressions: [] }
            : collector.getUsageCandidates(parsedFile, typesFromFile);
    }
}
