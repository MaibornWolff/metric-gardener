import { Factory as AccessorCollectorFactory } from "./callExpressions/Factory";
import { ParsedFile } from "../metrics/Metric";
import { Accessor } from "./callExpressions/AbstractCollector";
import { FullyQTN } from "./fullyQualifiedTypeNames/AbstractCollector";

export class PublicAccessorCollector {
    private accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessors(
        parsedFile: ParsedFile,
        namespacesOfFile: Map<string, FullyQTN>,
    ): Map<string, Accessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parsedFile);
        const accessors = collector?.getAccessors(parsedFile, namespacesOfFile);
        return accessors ?? new Map<string, Accessor[]>();
    }
}
