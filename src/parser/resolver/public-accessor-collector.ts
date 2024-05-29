import { type ParsedFile } from "../metrics/metric.js";
import { Factory as AccessorCollectorFactory } from "./accessors/factory.js";
import { type Accessor } from "./accessors/abstract-collector.js";
import { type TypeInfo } from "./types/abstract-collector.js";

export class PublicAccessorCollector {
    private readonly accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessorsFromFile(
        parsedFile: ParsedFile,
        typesFromFile: Map<FQTN, TypeInfo>,
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parsedFile);
        const accessors = collector?.getPublicAccessorsFromFile(parsedFile.filePath, typesFromFile);
        return accessors ?? new Map<string, Accessor[]>();
    }
}
