import Parser, { Query } from "tree-sitter";

export class QueryBuilder {
    private readonly treeSitterLanguage: any;
    private tree: Parser.Tree;
    private statements: string[] = [];

    constructor(treeSitterLanguage: any, tree: Parser.Tree) {
        this.treeSitterLanguage = treeSitterLanguage;
        this.tree = tree;
    }

    setStatements(statements: string[]) {
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

        // console.log("------------- Start Query: --------------")
        // console.log(queryString);
        // console.log("-----------------------------------------")

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
            try {
                const metricsQuery = new Query(this.treeSitterLanguage, statementCandidate);
                metricsQuery.matches(this.tree.rootNode);

                availableStatements.push(statementCandidate);
            } catch (error) {
                // This error can be ignored.
                // The specific statement seems not to be available for current language
            }
        }

        return availableStatements.join("\n");
    }
}
