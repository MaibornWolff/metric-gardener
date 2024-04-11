import { type ParsedFile } from "../../metrics/Metric.js";
import { QueryStrategy } from "./resolverStrategy/QueryStrategy.js";
import { FilenameStrategy } from "./resolverStrategy/FilenameResolver.js";

export type FullyQTN = {
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
    protected abstract getNamespaceResolvingStrategy(): NamespaceResolvingStrategy;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getNamespacesQuery(): string;

    getFullyQTNs(parsedFile: ParsedFile): Map<string, FullyQTN> {
        if (this.getNamespaceResolvingStrategy() === NamespaceResolvingStrategy.Query) {
            return new QueryStrategy().getFullyQTNs(
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
}
