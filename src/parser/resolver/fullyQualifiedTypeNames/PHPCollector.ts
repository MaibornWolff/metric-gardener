import { AbstractCollector, NamespaceResolvingStrategy } from "./AbstractCollector.js";

export class PHPCollector extends AbstractCollector {
    protected getNamespaceResolvingStrategy(): NamespaceResolvingStrategy {
        return NamespaceResolvingStrategy.Query;
    }

    protected getNamespaceDelimiter(): string {
        return "\\";
    }

    protected getNamespacesQuery(): string {
        return `
            (
                (namespace_definition
                    name: (namespace_name) @namespace_definition_name
                )
                [
                    (class_declaration
                        (name) @class_name
                        (base_clause (name) @extended_class)?
                        (class_interface_clause
                            (name)+ @implemented_class ("," (name) @implemented_class)*
                        )?
                    )
                    (interface_declaration
                        "interface" @class_type
                        (name) @class_name
                        (base_clause
                            (name)+ @implemented_class ("," (name) @implemented_class)*
                        )?
                    )
                ]+
            )
        `;
    }
}
