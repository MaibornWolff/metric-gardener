import { AbstractCollector, NamespaceResolvingStrategy } from "./AbstractCollector.js";

export class CSharpCollector extends AbstractCollector {
    protected getNamespaceResolvingStrategy(): NamespaceResolvingStrategy {
        return NamespaceResolvingStrategy.Query;
    }

    protected getNamespaceDelimiter(): string {
        return ".";
    }

    // TODO: @implemented_class must be named @extended_class for base classes
    //  currently this is not possible.
    //  We cannot differentiate extended and implemented classes from source code notation.
    protected getNamespacesQuery(): string {
        return `
            (namespace_declaration
                name: (_) @namespace_definition_name
                body: [
                        (declaration_list
                            (class_declaration
                                name: (identifier) @class_name
                                bases: (base_list
                                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                                )?
                                body: (declaration_list
                                    (class_declaration name: (identifier) @class_name)
                                )*
                            )
                        )
                        (declaration_list
                            (interface_declaration
                                "interface" @class_type
                                name: (identifier) @class_name
                                bases: (base_list
                                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                                )?
                            )
                        )
                        (declaration_list
                            (enum_declaration
                                name: (identifier) @class_name
                                bases: (base_list
                                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                                )?
                            )
                        )
                        (declaration_list
                            (struct_declaration
                                name: (identifier) @class_name
                                bases: (base_list
                                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                                )?
                            )
                        )
                        (declaration_list
                            (delegate_declaration
                                name: (identifier) @class_name
                            )
                        )
                ]+
            )
        `;
    }
}
