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
     * Query to select
     * Object Creations, Object Member Access/Calls, Return Types, Function/Method Parameters, Static Access
     * TODO constructor types, Typed Function Params like HashMap<Type>, Constant Access
     *
     * @protected
     */
    protected getUsagesQuery(): string {
        return `
            (method_declaration
                type: (_) @qualified_name
            )
            (method_declaration
                parameters: (_ (parameter type: (_) @qualified_name))
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
