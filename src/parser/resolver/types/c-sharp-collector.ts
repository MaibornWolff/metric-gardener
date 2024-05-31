import { type Query } from "tree-sitter";
import { SimpleQueryStatement } from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { AbstractCollector, type TypesResolvingStrategy } from "./abstract-collector.js";

export class TopLevelQueryStatement extends SimpleQueryStatement {
    constructor(query: string) {
        const globalQueryString = `
            (_ .([
                ${query}
            ]))
        `;
        super(globalQueryString);
    }
}

export class CSharpCollector extends AbstractCollector {
    public getTypesQuery(): Query {
        const allTypeQueryStrings = [
            this.getClassDeclarationQueryString(),
            this.getInterfaceDeclarationQueryString(),
            this.getEnumDeclarationQueryString(),
            this.getStructDeclarationQueryString(),
            this.getDelegateDeclarationQueryString(),
        ];

        const typeInNamespaceQueryString = `
            (namespace_declaration
                name: (_) @namespace_definition_name
                body: [
                   ${allTypeQueryStrings.map((query) => `(declaration_list (${query}))`).join("\n")}
                ]
            )
        `;
        const namespaceQueryStatement = new SimpleQueryStatement(typeInNamespaceQueryString);

        const globalTypeQueryString = `
            (compilation_unit .([
              ${allTypeQueryStrings.join("\n")}
            ]))
        `;
        const globalQueryStatement = new SimpleQueryStatement(globalTypeQueryString);

        const queryBuilder = new QueryBuilder(Language.CSharp);
        queryBuilder.addStatement(namespaceQueryStatement);
        queryBuilder.addStatement(globalQueryStatement);
        return queryBuilder.build();
    }

    protected getTypesResolvingStrategy(): TypesResolvingStrategy {
        return "Query";
    }

    protected getNamespaceDelimiter(): string {
        return ".";
    }

    private getClassDeclarationQueryString(): string {
        return `
            (class_declaration
                name: (identifier) @class_name
                bases: (base_list
                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                )?
                body: (declaration_list
                    (class_declaration name: (identifier) @class_name)
                )*
            ) @type_node
        `;
    }

    private getInterfaceDeclarationQueryString(): string {
        return `
            (interface_declaration
                "interface" @class_type
                name: (identifier) @class_name
                bases: (base_list
                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                )?
            ) @type_node
        `;
    }

    private getEnumDeclarationQueryString(): string {
        return `
            (enum_declaration
                name: (identifier) @class_name
                bases: (base_list
                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                )?
            ) @type_node
        `;
    }

    private getStructDeclarationQueryString(): string {
        return `
            (struct_declaration
                name: (identifier) @class_name
                bases: (base_list
                    (":" (identifier) @implemented_class ("," (identifier) @implemented_class)*)
                )?
            ) @type_node
        `;
    }

    private getDelegateDeclarationQueryString(): string {
        return `
            (delegate_declaration
                name: (identifier) @class_name
            ) @type_node
        `;
    }

    // TODO: @implemented_class must be named @extended_class for base classes
    //  currently this is not possible.
    //  We cannot differentiate extended and implemented classes from source code notation.
}
