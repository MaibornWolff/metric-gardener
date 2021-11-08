import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser from "tree-sitter";
import { grammars } from "../grammars";
import {ExpressionMetricMapping} from "../app";

export class McCabeComplexity implements Metric {
    private mccKeywordsSuperSet = [
        // functions and methods
        //"function",
        //"func",
        //"fun",

        // if statements and logical operators
        //"if",
        //"&&",
        //"||",
        //"??",

        // loops (do not count do and while together as +2)
        //"for",
        //"foreach",
        //"do",
        //"while",

        // misc
        //"case",
        //"throw",
        //"catch",
        //"goto",
    ];

    private mccStatementsSuperSet = [];

    private mccFunctionsAndMethodsSuperSet = [
        "(function) @function",
        "(function_declaration) @function",
        "(function_definition) @function",
        "(method_definition) @function.method",
        "(method_declaration) @function.method",
    ];

    private mccReturnStatementSuperSet = ["(return_statement) @return"];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (expressionMapping.metrics.includes(this.getName())) {
                if (expressionMapping.type === "keyword") {
                    this.mccKeywordsSuperSet.push(expressionMapping.expression);
                } else if (expressionMapping.type === "statement") {
                    const { expression } = expressionMapping
                    this.mccStatementsSuperSet.push("("+expression+") @" + expression)
                }
            }
        })
    }

    calculate(parseFile: ParseFile): MetricResult {
        const treeSitterLanguage = grammars.get(parseFile.language);

        const parser = new Parser();
        parser.setLanguage(treeSitterLanguage);

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);

        const queryBuilder = new QueryBuilder(treeSitterLanguage, tree);
        queryBuilder.setKeywords(this.mccKeywordsSuperSet);
        queryBuilder.setStatements(this.mccStatementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        for (const match of matches) {
            //console.log(match.captures);
        }

        queryBuilder.clear();
        queryBuilder.setStatements(this.mccFunctionsAndMethodsSuperSet);

        const functionsAndMethodsQuery = queryBuilder.build();
        const functionsOrMethods = functionsAndMethodsQuery.captures(tree.rootNode);

        queryBuilder.clear();
        queryBuilder.setStatements(this.mccReturnStatementSuperSet);

        const returnStatementQuery = queryBuilder.build();

        let additionalReturnStatementComplexity = 0;

        for (const capture of functionsOrMethods) {
            const returnCaptures = returnStatementQuery.captures(capture.node);
            if (returnCaptures.length > 1) {
                additionalReturnStatementComplexity += returnCaptures.length - 1;
            }
        }

        console.log("mcc - " + (matches.length + additionalReturnStatementComplexity));

        return {
            metricName: this.getName(),
            metricValue: matches.length + additionalReturnStatementComplexity,
        };
    }

    getName(): string {
        return "mcc"
    }
}
