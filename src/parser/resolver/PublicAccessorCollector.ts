import { Factory as AccessorCollectorFactory } from "./callExpressions/Factory";
import { ParseFile } from "../metrics/Metric";
import { Accessor } from "./callExpressions/AbstractCollector";
import { FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector";

export class PublicAccessorCollector {
    private accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessors(
        parseFile: ParseFile,
        namespacesOfFile: Map<string, FullyQTN>
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parseFile);
        return collector !== undefined
            ? collector.getAccessors(parseFile, namespacesOfFile)
            : new Map();
    }
}
