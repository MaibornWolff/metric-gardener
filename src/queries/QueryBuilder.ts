import Parser, { Query } from "tree-sitter";

export class QueryBuilder {
    private readonly treeSitterLanguage: any;
    private tree: Parser.Tree;
    private keywords: string[] = [];
    private statements: string[] = [];

    constructor(treeSitterLanguage: any, tree: Parser.Tree) {
        this.treeSitterLanguage = treeSitterLanguage;
        this.tree = tree;
    }

    setKeywords(keywords: string[]) {
        this.keywords = keywords;
    }

    setStatements(statements: string[]) {
        this.statements = statements;
    }

    clear() {
        this.keywords = [];
        this.statements = [];
    }

    build(): Query {
        let queryString = "";
        if (this.keywords.length > 0) {
            queryString += this.getBruteForcedKeywordsQuery();
        }

        if (this.statements.length > 0) {
            queryString +=
                queryString.length > 0
                    ? this.getBruteForcedStatementsQuery()
                    : "\n" + this.getBruteForcedStatementsQuery();
        }

        // console.log("------------- Start Query: --------------")
        // console.log(queryString);
        // console.log("-----------------------------------------")

        return new Query(this.treeSitterLanguage, queryString);
    }

    private getBruteForcedKeywordsQuery() {
        const availableMccKeywords = [];

        for (const mccKeyword of this.keywords) {
            try {
                const metricsQuery = new Query(
                    this.treeSitterLanguage,
                    `
              [
                "` +
                        mccKeyword +
                        `"
              ] @keyword
            `
                );

                metricsQuery.matches(this.tree.rootNode);

                availableMccKeywords.push(mccKeyword);
            } catch (e) {}
        }

        return '["' + availableMccKeywords.join('""') + '"] @keyword';
    }

    private getBruteForcedStatementsQuery() {
        const availableMccStatements = [];

        for (const mccStatement of this.statements) {
            try {
                const metricsQuery = new Query(this.treeSitterLanguage, mccStatement);
                metricsQuery.matches(this.tree.rootNode);

                availableMccStatements.push(mccStatement);
            } catch (e) {}
        }

        return availableMccStatements.join("\n");
    }
}
