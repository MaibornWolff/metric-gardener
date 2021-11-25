import { TreeParser } from "../../helper/TreeParser";
import { AbstractCollector } from "./AbstractCollector";

export class CSharpCollector extends AbstractCollector {
    protected getNamespaceDelimiter(): string {
        return ".";
    }

    protected getNamespacesQuery(): string {
        return `
            (namespace_declaration
                name: (_) @namespace_definition_name
                body: (_ (class_declaration name: (_) @class_name))
            )
        `;
    }
}
