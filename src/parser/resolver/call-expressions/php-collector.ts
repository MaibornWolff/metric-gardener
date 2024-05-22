import {
    type QueryStatement,
    SimpleLanguageSpecificQueryStatement,
} from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { AbstractCollector } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    protected noImportForClassesInSameOrParentNamespaces(): boolean {
        return false;
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

    protected getImportsQuery(): QueryStatement {
        const queryString = `
            (namespace_use_clause
                (qualified_name) @import_specifier
                (namespace_aliasing_clause (name) @alias)?
            )+
        `;

        return new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );
    }

    protected getGroupedImportsQuery(): QueryStatement {
        const queryString = `
            (namespace_use_declaration
                (namespace_name) @namespace_name
                (namespace_use_group
                    (namespace_use_group_clause
                        (namespace_name) @namespace_use_item_name
                        (_)? @namespace_use_alias
                    )
                )
            )
        `;

        return new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );
    }

    /**
     * We cannot query constructors and its parameters due to grammar structure
     * TODO Support more expressions
     */
    protected getUsagesQuery(): string {
        return `
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
    }
}
