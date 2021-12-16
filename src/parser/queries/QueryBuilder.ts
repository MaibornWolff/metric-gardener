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

    private getBruteForcedStatementsQuery() {
        const availableMccStatements: string[] = [];

        for (const mccStatement of this.statements) {
            try {
                const metricsQuery = new Query(this.treeSitterLanguage, mccStatement);
                metricsQuery.matches(this.tree.rootNode);

                availableMccStatements.push(mccStatement);
            } catch (error) {
                // This error can be ignored.
                // The specific statement seems not to be available for current language
            }
        }

        return availableMccStatements.join("\n");
    }
}
