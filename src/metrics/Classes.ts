import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser from "tree-sitter";
import { grammars } from "../grammars";

export class Classes implements Metric {
    private classesStatementSuperSet = ['"class" @class'];

    calculate(parseFile: ParseFile): MetricResult {
        const treeSitterLanguage = grammars.get(parseFile.language);

        const parser = new Parser();
        parser.setLanguage(treeSitterLanguage);

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);

        const queryBuilder = new QueryBuilder(treeSitterLanguage, tree);
        queryBuilder.setStatements(this.classesStatementSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        console.log("classes - " + matches.length);

        return {
            metricName: "classes",
            metricValue: matches.length
        }
    }
}
