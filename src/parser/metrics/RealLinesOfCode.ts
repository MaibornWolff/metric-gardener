import { QueryBuilder } from "../queries/QueryBuilder";
import { grammars } from "../helper/Grammars";
import { TreeParser } from "../helper/TreeParser";
import {
    ExpressionMetricMapping,
    ExpressionQueryStatement,
    QueryStatementInterface,
} from "../helper/Model";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { formatCaptures } from "../helper/Helper";

export class RealLinesOfCode implements Metric {
    private startRuleStatementsSuperSet: QueryStatementInterface[] = [];
    private commentStatementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        allNodeTypes.forEach((expressionMapping) => {
            if (
                expressionMapping.metrics.includes(this.getName()) &&
                expressionMapping.type === "statement"
            ) {
                const { expression, activated_for_languages } = expressionMapping;
                const queryStatement = new ExpressionQueryStatement(
                    expression,
                    activated_for_languages
                );

                if (expressionMapping.category === "start_rule") {
                    this.startRuleStatementsSuperSet.push(queryStatement);
                } else if (expressionMapping.category === "comment") {
                    this.commentStatementsSuperSet.push(queryStatement);
                }
            }
        });
    }

    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(
            grammars.get(parseFile.language),
            tree,
            parseFile.language
        );
        queryBuilder.setStatements(this.startRuleStatementsSuperSet);

        const query = queryBuilder.build();
        const startRuleMatches = query.matches(tree.rootNode);
        if (!startRuleMatches.length) {
            return {
                metricName: this.getName(),
                metricValue: 0,
            };
        }

        const startRuleCaptures = query.captures(tree.rootNode);
        const startRuleTextCaptures = formatCaptures(tree, startRuleCaptures);

        const emptyLines = this.countEmptyLines(startRuleTextCaptures[0].text);

        let loc = startRuleMatches[0].captures[0].node.endPosition.row;

        // Last line is an empty one, so add one line
        loc += startRuleTextCaptures[0].text.endsWith("\n") ? 1 : 0;

        queryBuilder.clear();
        queryBuilder.setStatements(this.commentStatementsSuperSet);

        const commentQuery = queryBuilder.build();
        const commentMatches = commentQuery.matches(tree.rootNode);

        const commentLines = commentMatches.reduce((accumulator, match) => {
            const captureNode = match.captures[0].node;
            return accumulator + captureNode.endPosition.row - captureNode.startPosition.row + 1;
        }, 0);

        const realLinesOfCode = Math.max(0, loc - commentLines - emptyLines);
        console.log(this.getName() + " - " + realLinesOfCode);

        return {
            metricName: this.getName(),
            metricValue: realLinesOfCode,
        };
    }

    private countEmptyLines(text: string) {
        return text.split(/\r\n|\r|\n/g).filter((entry) => /^[ \t]*$/.test(entry)).length;
    }

    getName(): string {
        return "real_lines_of_code";
    }
}
