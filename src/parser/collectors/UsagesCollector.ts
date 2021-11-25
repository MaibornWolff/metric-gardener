import { NamespaceReference } from "./namespaces/AbstractCollector";
import { Factory as UsageCollectorFactory } from "./usages/Factory";
import { UsageReference } from "./usages/AbstractCollector";

export class UsagesCollector {
    private usageCollectorFactory = new UsageCollectorFactory();
    private cache = new Map<string, UsageReference[]>();

    getUsages(parseFile: ParseFile, packages: Map<string, NamespaceReference>) {
        const collector = this.usageCollectorFactory.getCollector(parseFile);
        const usages = collector !== undefined ? collector.getUsages(parseFile, packages) : [];

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

    getAllUsages() {
        return this.cache.entries();
    }
}
