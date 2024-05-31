import { type Query } from "tree-sitter";
import { SimpleLanguageSpecificQueryStatement } from "../../queries/query-statements.js";
import { Language } from "../../../helper/language.js";
import { QueryBuilder } from "../../queries/query-builder.js";
import { AbstractCollector } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    protected getAccessorsQuery(): Query {
        const queryString = "";

        const queryStatement = new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.addStatement(queryStatement);
        return queryBuilder.build();
    }
}
