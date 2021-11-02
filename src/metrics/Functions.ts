import { QueryBuilder } from "../queries/QueryBuilder";
import fs from "fs";
import Parser, { Query } from "tree-sitter";
import { filesToParse, grammars } from "../grammars";

export class Functions implements Metric {
    private functionsStatementSuperSet = [
        '"function" @function',
        '"func" @function',
        '"fun" @function',
        "(function) @function",
        "(function_declaration) @function",
        "(method_definition) @function.method",
    ];

    calculate() {
        for (const [fileLanguage, parseFile] of filesToParse.entries()) {
            const treeSitterLanguage = grammars.get(fileLanguage);

            const parser = new Parser();
            parser.setLanguage(treeSitterLanguage);

            const sourceCode = fs.readFileSync(parseFile.filePath).toString();
            const tree = parser.parse(sourceCode);

            const queryBuilder = new QueryBuilder(treeSitterLanguage, tree);
            queryBuilder.setStatements(this.functionsStatementSuperSet);

            const query = queryBuilder.build();
            const matches = query.matches(tree.rootNode);

            console.log(parseFile.filePath + " - functions - " + matches.length);
        }
    }
}
