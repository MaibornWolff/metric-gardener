import { AbstractCollector } from "./abstract-collector.js";
import {SimpleLanguageSpecificQueryStatement} from "../../queries/query-statements.js";
import {Language} from "../../../helper/language.js";
import {QueryBuilder} from "../../queries/query-builder.js";
import {Query} from "tree-sitter";

export class PHPCollector extends AbstractCollector {
    protected getAccessorsQuery(): Query {
        const queryString = ""

        const queryStatement = new SimpleLanguageSpecificQueryStatement(
            queryString,
            new Set<Language>([Language.PHP]),
        );

        const queryBuilder = new QueryBuilder(Language.PHP);
        queryBuilder.setStatement(queryStatement);
        return queryBuilder.build();
    }
}
