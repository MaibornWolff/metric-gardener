import { Query } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Language, languageToGrammar } from "../helper/Language";
import { QueryStatementInterface } from "./QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class QueryBuilder {
    readonly #language: Language;
    readonly #treeSitterLanguage: any;
    #statements: QueryStatementInterface[] = [];

    constructor(language: Language) {
        this.#language = language;
        this.#treeSitterLanguage = languageToGrammar.get(language);
    }

    setStatements(statements: QueryStatementInterface[]) {
        this.#statements = statements;
    }

    clear() {
        this.#statements = [];
    }

    /**
     * Builds the query for running all currently set query statements on a syntax tree of the language
     * set on this QueryBuilder.
     * Includes only query statements that are both applicable and activated for the language.
     * @return The query, or undefined if the language is set to unknown.
     */
    build(): Query | undefined {
        let queryString = "";

        if (this.#language !== Language.Unknown) {
            if (this.#statements.length > 0) {
                queryString = this.getStatementsQuery();
            }

            dlog("------------- Start Query: --------------");
            dlog(queryString);
            dlog("-----------------------------------------");

            return new Query(this.#treeSitterLanguage, queryString);
        }
    }

    /**
     * Generates a query string for running all currently set query statements on a syntax tree of the language
     * set on this QueryBuilder.
     * Includes only query statements that are both applicable and activated for the language.
     * @return A query string.
     * @private
     */
    private getStatementsQuery() {
        const statementQueries: string[] = [];

        for (const statement of this.#statements) {
            if (statement.applicableFor(this.#language) && statement.activatedFor(this.#language)) {
                statementQueries.push(statement.toString());
            }
        }
        return statementQueries.join("\n");
    }
}
