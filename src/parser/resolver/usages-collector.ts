import { type ParsedFile } from "../metrics/metric.js";
import { Factory as UsageCollectorFactory } from "./call-expressions/factory.js";
import { type UsageCandidate, type CallExpression } from "./call-expressions/abstract-collector.js";
import type { TypeInfo } from "./types/abstract-collector.js";

export class UsagesCollector {
    private readonly usageCollectorFactory = new UsageCollectorFactory();

    getUsageCandidates(
        parsedFile: ParsedFile,
        typesFromFile: Map<FullyQualifiedName, TypeInfo>,
    ): {
        usageCandidates: UsageCandidate[];
        callExpressions: CallExpression[];
    } {
        const collector = this.usageCollectorFactory.getCollector(parsedFile.language);
        return collector === undefined
            ? { usageCandidates: [], callExpressions: [] }
            : collector.getUsageCandidates(parsedFile, typesFromFile);
    }
}
