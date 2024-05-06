import { type ParsedFile } from "../../metrics/metric.js";
import { QueryStrategy } from "./resolver-strategy/query-strategy.js";
import { FilenameStrategy } from "./resolver-strategy/filename-resolver.js";

export type FQTNInfo = {
    namespace: string;
    className: string;
    classType: "interface" | "class";
    source: string;
    namespaceDelimiter: string;
    extendedClass?: string;
    implementedClasses: string[];
};

export enum NamespaceResolvingStrategy {
    Query,
    Filename,
}

export abstract class AbstractCollector {
    getFQTNsFromFile(parsedFile: ParsedFile): Map<string, FQTNInfo> {
        if (this.getNamespaceResolvingStrategy() === NamespaceResolvingStrategy.Query) {
            return new QueryStrategy().getFQTNsFromFile(
                parsedFile,
                this.getNamespaceDelimiter(),
                this.getNamespacesQuery(),
            );
        }

        if (this.getNamespaceResolvingStrategy() === NamespaceResolvingStrategy.Filename) {
            return new FilenameStrategy().getFullyQTNs();
        }

        throw new Error(
            "Unsupported Namespace Resolving Strategy " +
                this.getNamespaceResolvingStrategy().toString(),
        );
    }

    protected abstract getNamespaceResolvingStrategy(): NamespaceResolvingStrategy;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getNamespacesQuery(): string;
}
