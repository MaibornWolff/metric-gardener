import { QueryBuilder } from "../queries/QueryBuilder";
import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import {
    QueryStatementInterface,
    SimpleLanguageSpecificQueryStatement,
} from "../queries/QueryStatements";
import { getQueryStatements } from "../helper/Helper";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Classes implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        this.statementsSuperSet = getQueryStatements(allNodeTypes, this.getName());
        this.addQueriesForJS_TS_TSX();
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
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
    addQueriesForJS_TS_TSX() {
        this.statementsSuperSet.push(
            new SimpleLanguageSpecificQueryStatement(
                "(type_alias_declaration value: (object_type))",
                ["ts", "tsx"],
            ),
        );
    }
    getName(): string {
        return FileMetric.classes;
    }
}
