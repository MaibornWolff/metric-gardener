import { AbstractCollector } from "./abstract-collector.js";
import {Query} from "tree-sitter";
import {SimpleLanguageSpecificQueryStatement} from "../../queries/query-statements.js";
import {Language} from "../../../helper/language.js";
import {QueryBuilder} from "../../queries/query-builder.js";

export class CSharpCollector extends AbstractCollector {
    protected getAccessorsQuery(): Query {
        const queryString =  `
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

        const queryStatement = new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.CSharp]),
        );

        const queryBuilder = new QueryBuilder(Language.CSharp);
        queryBuilder.setStatement(queryStatement);
        return queryBuilder.build();
    }
}
