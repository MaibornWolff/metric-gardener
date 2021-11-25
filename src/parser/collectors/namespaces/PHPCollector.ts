import { TreeParser } from "../../helper/TreeParser";
import { AbstractCollector } from "./AbstractCollector";

export class PHPCollector extends AbstractCollector {
    protected getNamespaceDelimiter(): string {
        return "\\";
    }

    protected getNamespacesQuery(): string {
        return `
            (
                (namespace_definition
                    name: (namespace_name) @namespace_definition_name
                )
                (class_declaration
                    (name) @class_name
                )+
            )
        `;
    }
}
