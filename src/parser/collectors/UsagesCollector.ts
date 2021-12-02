import { Factory as UsageCollectorFactory } from "./usages/Factory";
import { UsageCandidate } from "./usages/AbstractCollector";
import { NamespaceCollector } from "./NamespaceCollector";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();
    private cache = new Map<string, UsageCandidate[]>();

    getUsages(parseFile: ParseFile, namespaceCollector: NamespaceCollector): UsageCandidate[] {
        const collector = this.usageCollectorFactory.getCollector(parseFile);
        const usages =
            collector !== undefined
                ? collector.getUsageCandidates(parseFile, namespaceCollector)
                : [];

        if (usages.length === 0) {
            return usages;
        }

        if (!this.cache.has(parseFile.language)) {
            this.cache.set(parseFile.language, []);
        }

        const usagesByLanguage = this.cache.get(parseFile.language);
        usagesByLanguage.concat(usages);

        this.cache.set(parseFile.language, usagesByLanguage);

        return usages;
    }
}
