import { AbstractCollector } from "./AbstractCollector";

export class PHPCollector extends AbstractCollector {
    protected getNamespaceDelimiter(): string {
        return "\\";
    }

    protected getImportsQuery(): string {
        return `
            (namespace_use_clause
                (qualified_name) @namespace_use
                (namespace_aliasing_clause (name) @namespace_use_alias)?
            )+
        `;
    }

    protected getGroupedImportsQuery(): string {
        return `
            (namespace_use_declaration
                (namespace_name) @namespace_name
                (namespace_use_group
                    (namespace_use_group_clause
                        (namespace_name) @namespace_use_item_name
                        (_)? @namespace_use_alias
                    )
                )
            )
        `;
    }

    /**
     * Query to select Object Creations, Object Member Access/Calls, Return Types, Function/Method Parameters, Static Access
     *
     * class_constant_access_expression
     * scoped_call_expression
     *
     * @protected
     */
    protected getUsagesQuery(): string {
        return `
            (method_declaration
                (formal_parameters
                    (_ type: (_) @qualified_name)
                )
            )
            (method_declaration
                (
                    ":" return_type: (_) @qualified_name
                )
            )
            (object_creation_expression
                (qualified_name) @qualified_name
            )
            (class_constant_access_expression
                (qualified_name) @qualified_name
            )
            (scoped_call_expression
                (qualified_name) @qualified_name
            )
        `;
    }
}
