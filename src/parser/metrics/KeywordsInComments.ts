import { QueryBuilder } from "../queries/QueryBuilder.js";
import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryCapture } from "tree-sitter";
import { QueryStatementInterface } from "../queries/QueryStatements.js";
import { NodeTypeCategory, NodeTypeConfig } from "../helper/Model.js";
import { createRegexFor, getQueryStatementsByCategories } from "../helper/Helper.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class KeywordsInComments implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];
    private readonly nodeTypeCategory: NodeTypeCategory = NodeTypeCategory.Comment;
    private readonly keywords: string[] = ["bug", "wtf", "todo", "hack"];
    private readonly regexArray: RegExp[] = this.keywords.map((k) => createRegexFor(k));

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.statementsSuperSet = getQueryStatementsByCategories(
            allNodeTypes,
            this.nodeTypeCategory,
        );
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements(this.statementsSuperSet);
        const query = queryBuilder.build();
        let matchResult = 0;
        let captures: QueryCapture[] = [];

        if (query !== undefined) {
            captures = query.captures(tree.rootNode);
        }

        for (const capture of captures) {
            console.log(capture.node.text);
            for (const regex of this.regexArray) {
                const matched = capture.node.text.matchAll(regex);
                matchResult += Array.from(matched).length;
            }
        }
        console.log(matchResult);

        dlog(this.getName() + " - " + matchResult);

        return {
            metricName: this.getName(),
            metricValue: matchResult,
        };
    }

    getName(): string {
        return FileMetric.KeywordsInComments;
    }
}
