import { QueryBuilder } from "../queries/QueryBuilder";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import Parser from "tree-sitter";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Functions implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
    }

    async calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult> {
        const queryBuilder = new QueryBuilder(parseFile.fileExtension, tree);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "functions";
    }
}
