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
        console.log(
            parseFile,
            matches,
            matches[0].captures[0],
            startRuleCaptures,
            startRuleTextCaptures
        );

        const emptyLines = this.countEmptyLines(startRuleTextCaptures[0].text);
        console.log("Empty Lines", emptyLines);

        let loc = matches[0].captures[0].node.endPosition.row;

        // Last line is an empty one, so add one line
        loc += startRuleTextCaptures[0].text.endsWith("\n") ? 1 : 0;
        loc = Math.max(0, loc - emptyLines);

        console.log(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: loc,
        };
    }

    private countEmptyLines(text: string) {
        // from https://stackoverflow.com/questions/28260659/how-to-count-empty-lines-inside-a-string-in-javascript/28260746
        // ignore leading tabs and spaces
        // TODO not working for Windows Line Endings \r\n
        // this possibly counts the last \n as a new line
        // this would be done twice then because i do it manually already
        return text ? (text.match(/^([ \t]*$\r?\n)/gm) || []).length : 0;
        //return text ? (text.match(/(^(\r\n|\n|\r))|^\s*$/gm) || []).length : 0;
        //return text ? (text.match(/^([ \t]*$\r\n)/gm) || []).length : 0;
        //return text ? (text.match(/^[ \t]*((\r?\n)|(\r?\n|$))$/gm) || []).length : 0;
        //return text ? (text.match(/^[ \t]*$/gm) || []).length : 0;
    }

    getName(): string {
        return "lines_of_code";
    }
}
