import Parser, { Query } from "tree-sitter";
import { QueryStatementInterface } from "../helper/Model";
import { debuglog } from "node:util";

const dlog = debuglog("metric-gardener");

export class QueryBuilder {
    private readonly treeSitterLanguage: any;
    private tree: Parser.Tree;
    private readonly fileExtension: string;
    private statements: QueryStatementInterface[] = [];

    constructor(treeSitterLanguage: any, tree: Parser.Tree, fileExtension: string) {
        this.treeSitterLanguage = treeSitterLanguage;
        this.tree = tree;
        this.fileExtension = fileExtension;
    }

    setStatements(statements: QueryStatementInterface[]) {
        this.statements = statements;
    }

    clear() {
        this.statements = [];
    }

    build(): Query {
        let queryString = "";

        if (this.statements.length > 0) {
            queryString = this.getBruteForcedStatementsQuery();
        }

        dlog("------------- Start Query: --------------");
        dlog(queryString);
        dlog("-----------------------------------------");

        return new Query(this.treeSitterLanguage, queryString);
    }

    // This is not necessary anymore
    // due to the mapped node types (/resources/node-types-mapped.config)
    // and the information per expressions
    // in which language it is included
    // Thus, we do not have to figure out
    // if the expression is included in a language by query the expression
    // and catch an exception if it is not included.
    private getBruteForcedStatementsQuery() {
        const availableStatements: string[] = [];

        for (const statementCandidate of this.statements) {
            if (!statementCandidate.activatedFor(this.fileExtension)) {
                continue;
            }

            try {
                const statementQuery = statementCandidate.toQuery();
                const metricsQuery = new Query(
                    this.treeSitterLanguage,
                    statementCandidate.toQuery()
                );
                metricsQuery.matches(this.tree.rootNode);

                availableStatements.push(statementQuery);
            } catch (error) {
                // This error can be ignored.
                // The specific statement seems not to be available for current language
            }
        }

        return availableStatements.join("\n");
    }
}
