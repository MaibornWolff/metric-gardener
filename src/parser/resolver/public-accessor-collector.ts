import { type ParsedFile } from "../metrics/metric.js";
import { Factory as AccessorCollectorFactory } from "./call-expressions/factory.js";
import { type Accessor } from "./call-expressions/abstract-collector.js";
import { type FullyQTN } from "./fully-qualified-type-names/abstract-collector.js";

export class PublicAccessorCollector {
    private readonly accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessors(
        parsedFile: ParsedFile,
        namespacesOfFile: Map<string, FullyQTN>,
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parsedFile);
        const accessors = collector?.getAccessors(parsedFile, namespacesOfFile);
        return accessors ?? new Map<string, Accessor[]>();
    }
}
