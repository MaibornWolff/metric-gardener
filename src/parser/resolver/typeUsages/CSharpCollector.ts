import { AbstractCollector } from "./AbstractCollector.js";

export class CSharpCollector extends AbstractCollector {
    protected noImportForClassesInSameOrParentNamespaces(): boolean {
        return true;
    }

    protected indirectNamespaceReferencing(): boolean {
        return true;
    }

    protected getFunctionCallDelimiter(): string {
        return this.getNamespaceDelimiter();
    }

    protected getNamespaceDelimiter(): string {
        return ".";
    }

    protected getImportsQuery(): string {
        return `
            (using_directive
                (name_equals (identifier) @namespace_use_alias_prefix)?
                [
                    (qualified_name) @namespace_use
                    (identifier) @namespace_use
                ]
            )
        `;
    }

    protected getGroupedImportsQuery(): string {
        return "";
    }

    /**
     * TODO Support Constant Access, Further Types like records (see declaration_list in grammar).
     * TODO Check if we can just query all types at once!
     *
     * @protected
     */
    protected getUsagesQuery(): string {
        return `
            (generic_name
                (identifier) @qualified_name
                (type_argument_list (_) @qualified_name)
            )
            (method_declaration
                type: (_) @qualified_name
            )
            (method_declaration
                parameters: (_ (parameter type: (_) @qualified_name))
            )
            (property_declaration
                type: (_) @qualified_name
            )
            (constructor_declaration
                parameters: (_ (parameter type: (_) @qualified_name))
            )
            (object_creation_expression
                type: (_) @qualified_name
            )
            (member_access_expression) @call_expression
            (conditional_access_expression
                (member_binding_expression name: (_) @call_expression)
            ) @call_expression
            (invocation_expression
                function: (_) @call_expression
            )
            (member_access_expression
                expression: (_ (cast_expression type: (_) @qualified_name))
            )
            (for_each_statement
                type: (_) @qualified_name
            )
            (variable_declaration
                type: (_) @qualified_name
            )
            (cast_expression
                type: (_) @qualified_name
            )
            (as_expression
                right: (_) @qualified_name
            )
            (is_pattern_expression
                pattern: (_) @qualified_name
            )
            (is_pattern_expression
                pattern: (declaration_pattern type: (_) @qualified_name)
            )
            (attribute
                name: (_) @qualified_name
            )
        `;
    }
}
