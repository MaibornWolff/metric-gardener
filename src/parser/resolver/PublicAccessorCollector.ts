import { Factory as AccessorCollectorFactory } from "./callExpressions/Factory.js";
import { ParsedFile } from "../metrics/Metric.js";
import { Accessor } from "./callExpressions/AbstractCollector.js";
import { FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector.js";

export class PublicAccessorCollector {
    private accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessors(
        parsedFile: ParsedFile,
        namespacesOfFile: Map<string, FullyQTN>,
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parsedFile);
        return collector !== undefined
            ? collector.getAccessors(parsedFile, namespacesOfFile)
            : new Map();
    }
}
