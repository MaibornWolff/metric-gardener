import { type Query } from "tree-sitter";
import { SimpleQueryStatement } from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { AbstractCollector, type TypesResolvingStrategy } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    public getTypesQuery(): Query {
        const allTypeQueryStrings = [
            this.getClassDeclarationQueryString(),
            this.getInterfaceDeclarationQueryString(),
        ];

        const namespaceQueryString = `
            (
                (namespace_definition
                    name: (namespace_name) @namespace_definition_name
                )
                [
                    ${allTypeQueryStrings.join("\n")}
                ]+
            )
        `;
        const namespaceQueryStatement = new SimpleQueryStatement(namespaceQueryString);

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.addStatement(namespaceQueryStatement);
        return queryBuilder.build();
    }

    protected getTypesResolvingStrategy(): TypesResolvingStrategy {
        return "Query";
    }

    protected getNamespaceDelimiter(): string {
        return "\\";
    }

    private getClassDeclarationQueryString(): string {
        return `
            (class_declaration
                (name) @class_name
                (base_clause (name) @extended_class)?
                (class_interface_clause
                    (name)+ @implemented_class ("," (name) @implemented_class)*
                )?
            ) @type_node
        `;
    }

    private getInterfaceDeclarationQueryString(): string {
        return `
            (interface_declaration
                "interface" @class_type
                (name) @class_name
                (base_clause
                    (name)+ @implemented_class ("," (name) @implemented_class)*
                )?
            ) @type_node
        `;
    }
}
