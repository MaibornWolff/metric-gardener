import { debuglog, type DebugLoggerFunction } from "node:util";
import { type NodeTypeConfig } from "../helper/model.js";
import { createRegexFor } from "../helper/helper.js";
import { type Metric, type MetricName, type MetricResult, type ParsedFile } from "./metric.js";
import { CommentLines } from "./comment-lines.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class KeywordsInComments implements Metric {
    readonly #commentLinesCalculator: CommentLines;
    readonly #regex: RegExp;

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.#commentLinesCalculator = new CommentLines(allNodeTypes);
        this.#regex = createRegexFor(["bug", "wtf", "todo", "hack"]);
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const comments = this.#commentLinesCalculator.getQueryCapturesFrom(parsedFile);
        let metricValue = 0;

        for (const comment of comments) {
            const regexMatchArrays = comment.node.text.matchAll(this.#regex);
            metricValue += [...regexMatchArrays].length;
        }

        dlog(this.getName() + " - " + metricValue.toString());

        return {
            metricName: this.getName(),
            metricValue,
        };
    }

    getName(): MetricName {
        return "keywords_in_comments";
    }
}
