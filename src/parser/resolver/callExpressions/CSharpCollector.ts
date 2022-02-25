import { AbstractCollector } from "./AbstractCollector";

export class CSharpCollector extends AbstractCollector {
    protected getAccessorsQuery(): string {
        return `
            (property_declaration
                type: (_) @accessor_return_type
                name: (identifier) @accessor_name
            )
            (field_declaration
                (variable_declaration
                    type: (_) @accessor_return_type
                    .
                    (variable_declarator (identifier) @accessor_name)
                )
            )
            (method_declaration
                type: (_) @accessor_return_type
                name: (identifier) @accessor_name
            )
        `;
    }
}
