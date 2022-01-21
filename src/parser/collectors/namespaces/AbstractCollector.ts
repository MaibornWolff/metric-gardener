import { QueryResolver } from "./resolver/QueryResolver";
import { FilenameResolver } from "./resolver/FilenameResolver";
import { ParseFile } from "../../metrics/Metric";

export interface NamespaceDefinition {
    namespace: string;
    className: string;
    classType: string | "interface" | "class";
    source: string;
    namespaceDelimiter: string;
    extendedClass?: string;
    implementedClasses: string[];
}

export enum NamespaceResolvingStrategy {
    Query,
    Filename,
}

export abstract class AbstractCollector {
    protected abstract getNamespaceResolvingStrategy(): NamespaceResolvingStrategy;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getNamespacesQuery(): string;

    getNamespaces(parseFile: ParseFile): Map<string, NamespaceDefinition> {
        if (this.getNamespaceResolvingStrategy() === NamespaceResolvingStrategy.Query) {
            return new QueryResolver().getNamespaces(
                parseFile,
                this.getNamespaceDelimiter(),
                this.getNamespacesQuery()
            );
        }

        if (this.getNamespaceResolvingStrategy() === NamespaceResolvingStrategy.Filename) {
            return new FilenameResolver().getNamespaces();
        }

        throw Error(
            "Unsupported Namespace Resolving Strategy " + this.getNamespaceResolvingStrategy()
        );
    }
}
