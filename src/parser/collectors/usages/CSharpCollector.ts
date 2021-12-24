import { AbstractCollector } from "./AbstractCollector";

export class CSharpCollector extends AbstractCollector {
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
                (name_equals (_) @namespace_use_alias_prefix)?
                (qualified_name) @namespace_use
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
        `;
    }
}
