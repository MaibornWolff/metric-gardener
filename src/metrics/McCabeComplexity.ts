import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser, { Query } from "tree-sitter";
import { filesToParse, grammars } from "../grammars";

export class McCabeComplexity implements Metric {
    private mccKeywordsSuperSet = [
        // functions and methods
        "function",
        "func",
        "fun",

        // if statements and logical operators
        "if",
        "&&",
        "||",
        "??",

        // loops (do not count do and while together as +2)
        "for",
        "foreach",
        "do",
        "while",

        // misc
        "case",
        "throw",
        "catch",
        "goto",
    ];

    private mccStatementsSuperSet = [
        "(function) @function",
        "(function_declaration) @function",
        "(function_definition) @function",
        "(method_definition) @function.method",
        "(method_declaration) @function.method",
        "(ternary_expression) @ternary_operator",
        "(conditional_expression) @ternary_operator",
    ];

    private mccFunctionsAndMethodsSuperSet = [
        "(function) @function",
        "(function_declaration) @function",
        "(method_definition) @method",
    ];

    private mccReturnStatementSuperSet = ["(return_statement) @return"];

    calculate() {
        for (const [fileLanguage, parseFile] of filesToParse.entries()) {
            const treeSitterLanguage = grammars.get(fileLanguage);

            const parser = new Parser();
            parser.setLanguage(treeSitterLanguage);

            const sourceCode = fs.readFileSync(parseFile.filePath).toString();
            const tree = parser.parse(sourceCode);

            const queryBuilder = new QueryBuilder(treeSitterLanguage, tree);
            queryBuilder.setKeywords(this.mccKeywordsSuperSet);
            queryBuilder.setStatements(this.mccStatementsSuperSet);

            const query = queryBuilder.build();
            const matches = query.matches(tree.rootNode);

            queryBuilder.clear();
            queryBuilder.setStatements(this.mccFunctionsAndMethodsSuperSet);

            const functionsAndMethodsQuery = queryBuilder.build();
            const functionsOrMethods = functionsAndMethodsQuery.captures(
                tree.rootNode
            );

            queryBuilder.clear();
            queryBuilder.setStatements(this.mccReturnStatementSuperSet);

            const returnStatementQuery = queryBuilder.build();

            let additionalReturnStatementComplexity = 0;

            for (const capture of functionsOrMethods) {
                const returnCaptures = returnStatementQuery.captures(
                    capture.node
                );
                if (returnCaptures.length > 1) {
                    additionalReturnStatementComplexity +=
                        returnCaptures.length - 1;
                }
            }

            console.log(matches.length + additionalReturnStatementComplexity);

            console.log(parseFile.filePath + " - mcc - " + (matches.length + additionalReturnStatementComplexity));
        }
    }
}
