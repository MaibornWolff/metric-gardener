import { type ParsedFile } from "../metrics/Metric.js";
import { Factory as AccessorCollectorFactory } from "./callExpressions/Factory.js";
import { type Accessor } from "./callExpressions/AbstractCollector.js";
import { type FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector.js";

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
