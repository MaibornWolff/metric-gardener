import { debuglog, type DebugLoggerFunction } from "node:util";
import { Query } from "tree-sitter";
import { type Language, languageToGrammar } from "../../helper/language.js";
import { type QueryStatement } from "./query-statements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

const treeSitterQueryCache = new Map<Language, Map<string, Query>>();

export class QueryBuilder {
    readonly #language: Language;
    #statements: QueryStatement[] = [];

    constructor(language: Language) {
        this.#language = language;
    }

    addStatement(statements: QueryStatement): void {
        this.#statements.push(statements);
    }

    addStatements(statements: QueryStatement[]): void {
        if (this.#statements.length === 0) {
            this.#statements = statements;
        } else {
            this.#statements.push(...statements);
        }
    }

    clear(): void {
        this.#statements = [];
    }

    /**
     * Builds the query for running all currently set query statements on a syntax tree of the language
     * set on this QueryBuilder.
     * Includes only query statements that are both applicable and activated for the language.
     * @return The query, or undefined if the language is set to unknown.
     */
    build(): Query {
        let queryString = "";

        if (this.#statements.length > 0) {
            queryString = this.#getStatementsQuery();
        }

        dlog("------------- Start Query: --------------");
        dlog(queryString);
        dlog("-----------------------------------------");

        return this.#retrieveTreeSitterQuery(queryString);
    }

    /**
     * Tries to retrieve the tree-sitter query from the cache. If there is no matching query,
     * calls the constructor of tree-sitter.Parser.Query, which is a very performance-heavy operation.
     */
    #retrieveTreeSitterQuery(queryString: string): Query {
        const cachedQueriesForLanguage = treeSitterQueryCache.get(this.#language);

        if (cachedQueriesForLanguage === undefined) {
            treeSitterQueryCache.set(this.#language, new Map<string, Query>());
        } else {
            const cachedQuery = cachedQueriesForLanguage.get(queryString);
            if (cachedQuery !== undefined) {
                return cachedQuery;
            }
        }

        const newQuery = new Query(languageToGrammar.get(this.#language), queryString);
        treeSitterQueryCache.get(this.#language)?.set(queryString, newQuery);

        return newQuery;
    }

    /**
     * Generates a query string for running all currently set query statements on a syntax tree of the language
     * set on this QueryBuilder.
     * Includes only query statements that are both applicable and activated for the language.
     * @return A query string.
     * @private
     */
    #getStatementsQuery(): string {
        const statementQueries: string[] = [];

        for (const statement of this.#statements) {
            if (statement.applicableFor(this.#language) && statement.activatedFor(this.#language)) {
                statementQueries.push(statement.toString());
            }
        }

        return statementQueries.join("\n");
    }
}
