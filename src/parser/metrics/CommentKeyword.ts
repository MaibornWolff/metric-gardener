import { QueryBuilder } from "../queries/QueryBuilder.js";
import { Metric, MetricName, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { QueryMatch } from "tree-sitter";
import { QueryStatementInterface, SimpleQueryStatement } from "../queries/QueryStatements.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class CommentKeyword implements Metric {
    private readonly statementsSuperSet: QueryStatementInterface[] = [];

    private readonly keywords: string[] = ["BUG", "Bug", "bug", "TODO", "Todo", "todo", "HACK", "Hack", "hack", "WTF", "Wtf", "wtf"];

    constructor() {
        for (const keyword of this.keywords) {
            const regularexpression = "\b" + keyword + "(?![^s.])";
            const queryStatementsByKeywords = `((comment) @constant(#match? @constant "` + regularexpression + `"))`;
            this.statementsSuperSet.push(new SimpleQueryStatement(queryStatementsByKeywords));
        }
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const { language, tree } = parsedFile;
        const queryBuilder = new QueryBuilder(language);
        queryBuilder.setStatements(this.statementsSuperSet);

        const query = queryBuilder.build();
        let matches: QueryMatch[] = [];
        if (query !== undefined) {
            matches = query.matches(tree.rootNode);
        }
        for (const keyword of matches) {
            console.log(keyword.captures.toString());
        }

        dlog(this.getName() + " - " + matches.length);

        return {
            metricName: this.getName(), metricValue: matches.length
        };
    }

    getName(): MetricName {
        return "keywords_in_comments";
    }
}
