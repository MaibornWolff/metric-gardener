import { NamespaceDefinition } from "../AbstractCollector";

export class FilenameResolver {
    getNamespaces(): Map<string, NamespaceDefinition> {
        return new Map();
    }
}
