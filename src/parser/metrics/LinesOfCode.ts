import { TreeParser } from "../helper/TreeParser";
import { Metric, MetricResult, ParseFile } from "./Metric";

/**
 * Counts the number of lines in a file, including empty lines.
 */
export class LinesOfCode implements Metric {
    calculate(parseFile: ParseFile): MetricResult {
        const tree = TreeParser.getParseTree(parseFile);
        let loc = tree.rootNode.endPosition.row;

        // Avoid off-by-one error:
        // The number of the last row equals the number of lines in the file minus one,
        // as it is counted from line 0. So add one to the result:
        loc++;

        console.log(this.getName() + " - " + loc);

        return {
            metricName: this.getName(),
            metricValue: loc,
        };
    }

    getName(): string {
        return "lines_of_code";
    }
}
