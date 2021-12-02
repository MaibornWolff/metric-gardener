import { NamespaceReference } from "../AbstractCollector";

export class FilenameResolver {
    getNamespaces(): Map<string, NamespaceReference> {
        return new Map();
    }
}
