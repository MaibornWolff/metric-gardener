import { Factory as AccessorCollectorFactory } from "./accessors/Factory";
import { ParseFile } from "../metrics/Metric";
import { PublicAccessor } from "./accessors/AbstractCollector";
import { NamespaceDefinition } from "./namespaces/AbstractCollector";

export class PublicAccessorCollector {
    private accessorCollectorFactory = new AccessorCollectorFactory();

    getPublicAccessors(
        parseFile: ParseFile,
        namespacesOfFile: Map<string, NamespaceDefinition>
    ): Map<string, PublicAccessor[]> {
        const collector = this.accessorCollectorFactory.getCollector(parseFile);
        return collector !== undefined
            ? collector.getPublicAccessors(parseFile, namespacesOfFile)
            : new Map();
    }
}
