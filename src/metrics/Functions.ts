import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser from "tree-sitter";
import { grammars } from "../grammars";
import {ExpressionMetricMapping} from "../app";

export class Functions implements Metric {
    private functionsStatementSuperSet = [
        //"(function) @function",
        //"(function_declaration) @function",
        //"(function_definition) @function",
        //"(method_definition) @function.method",
        //"(method_declaration) @function.method",
        //"(arrow_function) @function",
    ];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (expressionMapping.metrics.includes(this.getName()) && expressionMapping.type === "statement") {
                const { expression } = expressionMapping
                this.functionsStatementSuperSet.push("("+expression+") @" + expression)
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
        queryBuilder.setStatements(this.functionsStatementSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        console.log("functions - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "functions"
    }
}
