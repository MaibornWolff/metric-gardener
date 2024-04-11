import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryMatch } from "tree-sitter";
import { QueryBuilder } from "../queries/QueryBuilder.js";
import { NodeTypeCategory, type NodeTypeConfig } from "../helper/Model.js";
import { getQueryStatementsByCategories } from "../helper/Helper.js";
import { Language } from "../helper/Language.js";
import { type QueryStatementInterface, SimpleQueryStatement } from "../queries/QueryStatements.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./Metric.js";

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

    calculate(parsedFile: ParsedFile): MetricResult {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        if (language === Language.Java) {
            // Add query for instance init block in Java
            queryBuilder.setStatements([
                ...this.statementsSuperSet,
                new SimpleQueryStatement("(class_body (block)) @initBlock"),
            ]);
        } else {
            queryBuilder.setStatements(this.statementsSuperSet);
        }

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }

        dlog(this.getName() + " - " + matches.length.toString());

        return {
            metricName: this.getName(),
            metricValue: matches.length,
        };
    }

    getName(): MetricName {
        return "functions";
    }
}
