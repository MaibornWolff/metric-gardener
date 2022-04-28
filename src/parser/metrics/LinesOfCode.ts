import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping } from "../helper/Model";
import { formatCaptures, getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";

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
        const startRuleCaptures = query.captures(tree.rootNode);
        if (!matches.length) {
            return {
                metricName: this.getName(),
                metricValue: 0,
            };
        }

        const startRuleTextCaptures = formatCaptures(tree, startRuleCaptures);

        let loc = matches[0].captures[0].node.endPosition.row;

        // Last line is an empty one, so add one line
        loc += startRuleTextCaptures[0].text.endsWith("\n") ? 1 : 0;

        console.log(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: loc,
        };
    }

    getName(): string {
        return "lines_of_code";
    }
}
