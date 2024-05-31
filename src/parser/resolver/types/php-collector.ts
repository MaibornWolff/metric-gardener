import { type Query } from "tree-sitter";
import { SimpleLanguageSpecificQueryStatement } from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { AbstractCollector, type TypesResolvingStrategy } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    public getTypesQuery(): Query {
        const queryString = `
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
                    ) @type_node
                    (interface_declaration
                        "interface" @class_type
                        (name) @class_name
                        (base_clause
                            (name)+ @implemented_class ("," (name) @implemented_class)*
                        )?
                    ) @type_node
                ]+
            )
        `;

        const queryStatement = new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.addStatement(queryStatement);
        return queryBuilder.build();
    }

    protected getTypesResolvingStrategy(): TypesResolvingStrategy {
        return "Query";
    }

    protected getNamespaceDelimiter(): string {
        return "\\";
    }
}
