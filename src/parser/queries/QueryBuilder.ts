import Parser, { Query } from "tree-sitter";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Languages, languageToGrammar } from "../helper/Languages";
import { ParseFile } from "../metrics/Metric";
import { QueryStatementInterface } from "../helper/QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class QueryBuilder {
    private readonly language: Languages;
    private readonly treeSitterLanguage: any;
    private tree: Parser.Tree;
    private statements: QueryStatementInterface[] = [];

    constructor(parseFile: ParseFile, tree: Parser.Tree) {
        this.tree = tree;
        this.language = parseFile.language;
        this.treeSitterLanguage = languageToGrammar.get(this.language);
    }

    setStatements(statements: QueryStatementInterface[]) {
        this.statements = statements;
    }

    clear() {
        this.statements = [];
    }

    /**
     * Builds the query for finding the currently set statements in code of the currently set language
     * @return The query, or undefined if the file extension / language of the source file is not supported.
     */
    build(): Query | undefined {
        let queryString = "";

        if (this.language !== Languages.Unknown) {
            if (this.statements.length > 0) {
                queryString = this.getStatementsQuery();
            }

            dlog("------------- Start Query: --------------");
            dlog(queryString);
            dlog("-----------------------------------------");

            return new Query(this.treeSitterLanguage, queryString);
        }
    }

    /**
     * Generates a query string for finding the currently set statements in code of the currently set language.
     * Returns an empty query if the language is not supported.
     * @return A query string.
     * @private
     */
    private getStatementsQuery() {
        const statementQueries: string[] = [];

        for (const statement of this.statements) {
            if (statement.applicableFor(this.language) && statement.activatedFor(this.language)) {
                statementQueries.push(statement.toQuery());
            }
        }
        return statementQueries.join("\n");
    }
}
