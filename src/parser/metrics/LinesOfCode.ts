import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";

export class LinesOfCode implements Metric {
    private readonly statementsSuperSet: string[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        const loc = matches.length > 0 ? matches[0].captures[0].node.endPosition.row : 0;
        console.log(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "lines_of_code";
    }
}
