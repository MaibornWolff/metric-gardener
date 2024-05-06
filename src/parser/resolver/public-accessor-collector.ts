import { type ParsedFile } from "../metrics/metric.js";
import { Factory as AccessorCollectorFactory } from "./call-expressions/factory.js";
import { type Accessor } from "./call-expressions/abstract-collector.js";
import { type FQTNInfo } from "./fully-qualified-type-names/abstract-collector.js";

export class PublicAccessorCollector {
    private readonly accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessorsFromFile(
        parsedFile: ParsedFile,
        FQTNsFromFile: Map<string, FQTNInfo>,
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parsedFile);
        const accessors = collector?.getPublicAccessorsFromFile(parsedFile, FQTNsFromFile);
        return accessors ?? new Map<string, Accessor[]>();
    }
}
