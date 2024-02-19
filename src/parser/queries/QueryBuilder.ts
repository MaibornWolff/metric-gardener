import { Query } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Language, languageToGrammar } from "../helper/Language";
import { QueryStatementInterface } from "./QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

const treeSitterQueryCache = new Map<Language, Map<string, CachedQuery>>();

interface CachedQuery {
    language: Language;
    queryString: string;
    query: Query;
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

            return this.#retrieveTreeSitterQuery(queryString);
        }
    }

    /**
     * Tries to retrieve the tree-sitter query from the cache. If there is no matching query,
     * calls the constructor of tree-sitter.Parser.Query, which is a very performance-heavy operation.
     */
    #retrieveTreeSitterQuery(queryString: string): Query {
        let cachedQueriesForLanguage = treeSitterQueryCache.get(this.#language);

        if (cachedQueriesForLanguage !== undefined) {
            const cachedQuery = cachedQueriesForLanguage.get(queryString);
            if (
                cachedQuery !== undefined &&
                cachedQuery.queryString === queryString &&
                cachedQuery.language === this.#language
            ) {
                return cachedQuery.query;
            }
        }
        const newQuery = new Query(languageToGrammar.get(this.#language), queryString);

        if (cachedQueriesForLanguage === undefined) {
            cachedQueriesForLanguage = new Map<string, CachedQuery>();
            treeSitterQueryCache.set(this.#language, cachedQueriesForLanguage);
        }
        treeSitterQueryCache.get(this.#language)?.set(queryString, {
            language: this.#language,
            queryString: queryString,
            query: newQuery,
        });

        return newQuery;
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
