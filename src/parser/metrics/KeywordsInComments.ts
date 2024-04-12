import { Metric, MetricName, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { NodeTypeConfig } from "../helper/Model.js";
import { createRegexFor } from "../helper/Helper.js";
import { CommentLines } from "./CommentLines.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class KeywordsInComments implements Metric {
    readonly #commentLinesCalculator: CommentLines;
    readonly #regex: RegExp;

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.#commentLinesCalculator = new CommentLines(allNodeTypes);
        const keywords: string[] = ["bug", "wtf", "todo", "hack"];
        this.#regex = createRegexFor(keywords);
    }

    calculate(parsedFile: ParsedFile): MetricResult {
        const comments = this.#commentLinesCalculator.getQueryCapturesFrom(parsedFile);
        let metricValue = 0;

        for (const comment of comments) {
            const regexMatchArrays = comment.node.text.matchAll(this.#regex);
            metricValue += Array.from(regexMatchArrays).length;
        }

        dlog(this.getName() + " - " + metricValue.toString());

        return {
            metricName: this.getName(),
            metricValue: metricValue,
        };
    }

    getName(): MetricName {
        return "keywords_in_comments";
    }
}
