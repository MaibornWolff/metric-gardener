import { debuglog, type DebugLoggerFunction } from "node:util";
import { type QueryMatch } from "tree-sitter";
import { QueryBuilder } from "../queries/query-builder.js";
import { NodeTypeCategory, type NodeTypeConfig } from "../../helper/model.js";
import { getQueryStatementsByCategories } from "../../helper/helper.js";
import { Language } from "../../helper/language.js";
import { type QueryStatement, SimpleQueryStatement } from "../queries/query-statements.js";
import { type MetricName, type Metric, type MetricResult, type ParsedFile } from "./metric.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Functions implements Metric {
    private readonly statementsSuperSet: QueryStatement[] = [];

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
            queryBuilder.addStatements([
                ...this.statementsSuperSet,
                new SimpleQueryStatement("(class_body (block)) @initBlock"),
            ]);
        } else {
            queryBuilder.addStatements(this.statementsSuperSet);
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
