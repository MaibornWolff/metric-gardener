import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("Perl metrics tests", () => {
    const path = "./resources/perl/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath: string, metric: FileMetric, expected: number) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(path);
    });

    // describe("parsing complexity metric", () => {});

    // describe("parsing functions metric", () => {});

    // describe("parsing classes metric", () => {});

    // describe("parsing lines_of_code metric", () => {});

    // describe("parsing comment_lines metric", () => {});

    // describe("parsing real_lines_of_code metric", () => {});

    // describe("parsing max_nesting_level metric", () => {}); ???

    // describe("parsing coupling metric", () => {}); ???
});
