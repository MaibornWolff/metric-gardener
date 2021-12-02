import { AbstractCollector } from "./AbstractCollector";

export class CSharpCollector extends AbstractCollector {
    protected getNamespaceDelimiter(): string {
        return ".";
    }

    protected getImportsQuery(): string {
        return `
            (using_directive
                (qualified_name) @namespace_use
            )
        `;
    }

    protected getGroupedImportsQuery(): string {
        return "";
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
            (object_creation_expression
                type: (_) @qualified_name
            )
            (member_access_expression) @qualified_name
        `;
    }
}
