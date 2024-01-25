import Parser, { Query } from "tree-sitter";
import { QueryStatementInterface } from "../helper/Model";
import { debuglog, DebugLoggerFunction } from "node:util";
import { Languages, languageToGrammar } from "../helper/Languages";
import { ParseFile } from "../metrics/Metric";

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

    /**
     * ONLY FOR DEBUGGING PURPOSES!
     * This lets you compare the result of the new approach for getStatementsQuery which relies on the "language"
     * field of the expression mappings to the old, very slow bruteforce approach.
     * @param returnBruteforceResult Whether to return the result of the bruteforce approach or the new approach.
     * @return A query string.
     * @private
     */
    private debugCompareBruteforceToMapped(returnBruteforceResult: boolean) {
        const includedOnlyByMapping: number[] = [];
        const includedOnlyByBruteforce: number[] = [];

        const statementQueries: string[] = [];

        for (let i = 0; i < this.statements.length; i++) {
            const statementCandidate = this.statements[i];
            let chosenByMapping = false;

            if (
                statementCandidate.applicableFor(this.language) &&
                statementCandidate.activatedFor(this.language)
            ) {
                chosenByMapping = true;
                if (!returnBruteforceResult) {
                    statementQueries.push(statementCandidate.toQuery());
                }
            }

            if (statementCandidate.activatedFor(this.language)) {
                try {
                    const metricsQuery = new Query(
                        this.treeSitterLanguage,
                        statementCandidate.toQuery()
                    );
                    metricsQuery.matches(this.tree.rootNode);

                    // There was no error, so it is chosen by the bruteforce method:
                    if (!chosenByMapping) {
                        includedOnlyByBruteforce.push(i);
                    }
                    if (returnBruteforceResult) {
                        statementQueries.push(statementCandidate.toQuery());
                    }
                } catch (error) {
                    // There was an error, so it is not chosen by the bruteforce method:
                    if (chosenByMapping) {
                        includedOnlyByMapping.push(i);
                    }
                }
            }
        }

        if (includedOnlyByMapping.length > 0) {
            console.log(
                "###### The following statements were only included by the new mapping method: ######"
            );
            for (const index of includedOnlyByMapping) {
                console.log(this.statements[index]);
            }
        }
        if (includedOnlyByBruteforce.length > 0) {
            console.log(
                "###### The following statements were only included by the bruteforce method: ######"
            );
            for (const index of includedOnlyByBruteforce) {
                console.log(this.statements[index]);
            }
        }

        return statementQueries.join("\n");
    }
}
