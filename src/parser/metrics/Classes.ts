import { QueryBuilder } from "../queries/QueryBuilder";
import { ExpressionMetricMapping } from "../helper/Model";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import {
    ExpressionQueryStatement,
    QueryStatementInterface,
    SimpleLanguageSpecificQueryStatement,
} from "../queries/QueryStatements";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class Classes implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    constructor(allNodeTypes: ExpressionMetricMapping[]) {
        for (const nodeType of allNodeTypes) {
            if (nodeType.metrics.includes(this.getName())) {
                if (nodeType.expression === "type_alias_declaration") {
                    this.statementsSuperSet.push(
                        new SimpleLanguageSpecificQueryStatement(
                            "(type_alias_declaration value: (object_type))",
                            nodeType.languages,
                            nodeType.activated_for_languages,
                        ),
                    );
                } else {
                    this.statementsSuperSet.push(
                        new ExpressionQueryStatement(
                            nodeType.expression,
                            nodeType.languages,
                            nodeType.activated_for_languages,
                        ),
                    );
                }
            }
        }
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

    getName(): string {
        return FileMetric.classes;
    }
}
