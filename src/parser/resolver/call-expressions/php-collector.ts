import { type Query } from "tree-sitter";
import { SimpleLanguageSpecificQueryStatement } from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { AbstractCollector } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    protected importForClassesInSameOrParentNamespaces(): boolean {
        return true;
    }

    protected indirectNamespaceReferencing(): boolean {
        return false;
    }

    protected getFunctionCallDelimiter(): string {
        return "->";
    }

    protected getNamespaceDelimiter(): string {
        return "\\";
    }

    protected getImportsQuery(): Query {
        const singleImportQueryString = `
            (namespace_use_clause
                (qualified_name) @import_specifier
                (namespace_aliasing_clause (name) @alias)?
            )
        `;
        const groupImportQueryString = `
            (namespace_use_declaration
                (namespace_name) @grouped_import_namespace
                (namespace_use_group
                    (namespace_use_group_clause
                        (namespace_name) @grouped_import_name
                        (_)? @grouped_import_alias
                    )
                )
            )
        `;

        const singleImportQueryStatement = new SimpleLanguageSpecificQueryStatement(
            singleImportQueryString,
            new Set<Language>([Language.PHP]),
        );
        const groupImportQueryStatement = new SimpleLanguageSpecificQueryStatement(
            groupImportQueryString,
            new Set<Language>([Language.PHP]),
        );

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.setStatements([singleImportQueryStatement, groupImportQueryStatement]);
        return queryBuilder.build();
    }

    /**
     * We cannot query constructors and its parameters due to grammar structure
     * TODO Support more expressions
     */
    protected getUsagesQuery(): Query {
        const queryString = `
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
            (property_declaration
                type: (_) @qualified_name
            )
            (object_creation_expression
                (qualified_name) @qualified_name
            )
            (class_constant_access_expression
                (qualified_name) @call_expression
            )
            (scoped_call_expression
                (qualified_name) @call_expression
            )
        `;

        const queryStatement = new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.setStatement(queryStatement);
        return queryBuilder.build();
    }
}
