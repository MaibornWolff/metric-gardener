import { QueryBuilder } from "../queries/QueryBuilder";
import { fileExtensionToGrammar } from "../helper/FileExtensionToGrammar";
import { TreeParser } from "../helper/TreeParser";
import { ExpressionMetricMapping, QueryStatementInterface } from "../helper/Model";
import { getQueryStatements } from "../helper/Helper";
import { Metric, MetricResult, ParseFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Classes implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
    }

    async calculate(parseFile: ParseFile): Promise<MetricResult> {
        const tree = await TreeParser.getParseTreeAsync(parseFile);

        const queryBuilder = new QueryBuilder(
            fileExtensionToGrammar.get(parseFile.fileExtension),
            tree,
            parseFile.fileExtension
        );
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        const matches = query.matches(tree.rootNode);

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): string {
        return "classes";
    }
}
