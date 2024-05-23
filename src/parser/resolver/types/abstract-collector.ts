import { type ParsedFile } from "../../metrics/metric.js";
import { TypesQueryStrategy } from "./resolver-strategy/types-query-strategy.js";
import { FileNameStrategy } from "./resolver-strategy/filename-resolver.js";

type TypeName = string;
export type TypeInfo = {
    namespace: string;
    typeName: string;
    classType: "interface" | "class";
    sourceFile: string;
    namespaceDelimiter: string;
    extendedFrom?: string;
    implementedFrom: string[];
};

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

    protected abstract getTypesResolvingStrategy(): TypesResolvingStrategy;
    protected abstract getNamespaceDelimiter(): string;
    protected abstract getTypesQuery(): string;
}
