import { type Query, type SyntaxNode } from "tree-sitter";
import { type ParsedFile } from "../../metrics/metric.js";
import { TypesQueryStrategy } from "./resolver-strategy/types-query-strategy.js";
import { FileNameStrategy } from "./resolver-strategy/filename-resolver.js";

type TypeName = string;
export type TypeInfo = {
    node?: SyntaxNode;
    namespace: string;
    typeName: string;
    classType: ClassType;
    sourceFile: string;
    namespaceDelimiter: string;
    extendedFrom?: string;
    implementedFrom: string[];
};
export type ClassType = "interface" | "class";
export type TypesResolvingStrategy = "Query" | "Filename";

export abstract class AbstractCollector {
    getTypesFromFile(parsedFile: ParsedFile): Map<TypeName, TypeInfo> {
        if (this.getTypesResolvingStrategy() === "Query") {
            return new TypesQueryStrategy().getTypesFromFile(
                parsedFile,
                this.getNamespaceDelimiter(),
                this.getTypesQuery(),
            );
        }

        if (this.getTypesResolvingStrategy() === "Filename") {
            return new FileNameStrategy().getTypes();
        }

        throw new Error("Unsupported Types Resolving Strategy " + this.getTypesResolvingStrategy());
    }
    public abstract getTypesQuery(): Query;
    protected abstract getTypesResolvingStrategy(): TypesResolvingStrategy;
    protected abstract getNamespaceDelimiter(): string;
}
