import { QueryBuilder } from "../queries/QueryBuilder";
import { NodeTypeCategory, NodeTypeConfig } from "../helper/Model";
import { getQueryStatementsByCategories } from "../helper/Helper";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import { Language } from "../helper/Language";
import { QueryStatementInterface, SimpleQueryStatement } from "../queries/QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Functions implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.statementsSuperSet = getQueryStatementsByCategories(
            allNodeTypes,
            NodeTypeCategory.Function,
        );
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        if (language === Language.Java) {
            //add query for instance init block in Java
            queryBuilder.setStatements(
                this.statementsSuperSet.concat(
                    new SimpleQueryStatement("(class_body (block)) @initBlock"),
                ),
            );
        } else {
            queryBuilder.setStatements(this.statementsSuperSet);
        }

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
        return FileMetric.functions;
    }
}
