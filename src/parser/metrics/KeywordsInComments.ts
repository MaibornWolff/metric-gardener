import { FileMetric, Metric, MetricResult, ParsedFile } from "./Metric.js";
import { debuglog, DebugLoggerFunction } from "node:util";
import { NodeTypeConfig } from "../helper/Model.js";
import { createRegexFor } from "../helper/Helper.js";
import { CommentLines } from "./CommentLines.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

export class KeywordsInComments implements Metric {
    readonly #commentLinesCalculator: CommentLines;
    readonly #keywords: string[] = ["bug", "wtf", "todo", "hack"];
    readonly #regexArray: RegExp[];

    constructor(allNodeTypes: NodeTypeConfig[]) {
        this.#commentLinesCalculator = new CommentLines(allNodeTypes);
        this.#regexArray = this.#keywords.map((k) => createRegexFor(k));
    }

    async calculate(parsedFile: ParsedFile): Promise<MetricResult> {
        const captures = this.#commentLinesCalculator.getQueryCapturesFrom(parsedFile);
        let metricValue = 0;

        for (const capture of captures) {
            for (const regex of this.#regexArray) {
                const regexMatchArrays = capture.node.text.matchAll(regex);
                metricValue += Array.from(regexMatchArrays).length;
            }
        }

        dlog(this.getName() + " - " + metricValue);

        return {
            metricName: this.getName(),
            metricValue: metricValue,
        };
    }

    getName(): string {
        return FileMetric.keywordsInComments;
    }
}
