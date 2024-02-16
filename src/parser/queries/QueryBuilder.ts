import { Query } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Language, languageToGrammar } from "../helper/Language";
import { QueryStatementInterface } from "./QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

const treeSitterQueryCache = new Map<any, Map<string, Query>>();

/**
 * Tries to retrieve the tree-sitter query from the cache. If there is no matching query,
 * calls the constructor of tree-sitter.Parser.Query, which is a very performance-heavy operation.
 */
function retrieveTreeSitterQuery(treeSitterGrammar: any, queryString: string) {
    let cachedQueriesForLanguage = treeSitterQueryCache.get(treeSitterGrammar);

    if (cachedQueriesForLanguage !== undefined) {
        const cachedQuery = cachedQueriesForLanguage.get(queryString);
        if (cachedQuery !== undefined) {
            return cachedQuery;
        }
    }
    const newQuery = new Query(treeSitterGrammar, queryString);

    if (cachedQueriesForLanguage === undefined) {
        cachedQueriesForLanguage = new Map<string, Query>();
        treeSitterQueryCache.set(treeSitterGrammar, cachedQueriesForLanguage);
    }
    treeSitterQueryCache.get(treeSitterGrammar)?.set(queryString, newQuery);
}

export class QueryBuilder {
    readonly #language: Language;
    readonly treeSitterGrammar: any;
    #statements: QueryStatementInterface[] = [];

    constructor(language: Language) {
        this.#language = language;
        this.treeSitterGrammar = languageToGrammar.get(language);
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
                queryString = this.#getStatementsQuery();
            }

            dlog("------------- Start Query: --------------");
            dlog(queryString);
            dlog("-----------------------------------------");

            return retrieveTreeSitterQuery(this.treeSitterGrammar, queryString);
        }
    }

    /**
     * Generates a query string for running all currently set query statements on a syntax tree of the language
     * set on this QueryBuilder.
     * Includes only query statements that are both applicable and activated for the language.
     * @return A query string.
     * @private
     */
    #getStatementsQuery() {
        const statementQueries: string[] = [];

        for (const statement of this.#statements) {
            if (statement.applicableFor(this.#language) && statement.activatedFor(this.#language)) {
                statementQueries.push(statement.toString());
            }
        }
        return statementQueries.join("\n");
    }
}
