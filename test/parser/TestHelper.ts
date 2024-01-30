import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { Configuration } from "../../src/parser/Configuration";
import { CouplingResult } from "../../src/parser/metrics/Metric";
import { strcmp } from "../../src/parser/helper/Helper";

/**
 * Gets a parser configuration for the test cases.
 * @param sourcesPath Path to the source files.
 * @param parseDependencies Whether to enable parsing dependencies.
 * @param formatFilePaths Whether to format the output file paths to be independent
 * of project location and platform.
 * When this is enabled, do not forget to also format the file path when accessing metric results from the output.
 * You should use {@link formatPrintPath} for this, e.g.:
 * <pre><code>
 * results.fileMetrics.get(formatPrintPath(inputPath, config))
 * </code></pre>
 */
export function getParserConfiguration(
    sourcesPath: string,
    parseDependencies = false,
    formatFilePaths = false
) {
    return new Configuration(
        sourcesPath,
        "invalid/output/path",
        parseDependencies,
        "",
        false,
        formatFilePaths, // For project location-independent testing
        formatFilePaths // For platform-independent testing
    );
}
/**
 * Sorts the contents of the specified {@link CouplingResult} in a deterministic way.
 * This is necessary as there can be deviations concerning the order
 * in which files are found on different platforms.
 * @param couplingResult The CouplingResult whose contents should be sorted.
 */
export function sortCouplingResults(couplingResult: CouplingResult) {
    // Sort the metrics in ascending order of the file paths
    couplingResult.metrics = new Map(
        [...couplingResult.metrics.entries()].sort((a, b) => strcmp(a[0], b[0]))
    );
    couplingResult.relationships.sort((a, b) => {
        // Unique ID for relationships adapted from metrics/coupling/Coupling.ts getRelationships(...)
        const uniqueIdA = a.toNamespace + a.fromNamespace;
        const uniqueIdB = b.toNamespace + b.fromNamespace;
        return strcmp(uniqueIdA, uniqueIdB);
    });
}

/**
 * Tests if the file metric is calculated correctly.
 * @param inputPath Path to test source files.
 * @param metric Name of the metric.
 * @param expected Expected test result.
 * */
export async function testFileMetrics(inputPath: string, metric: string, expected: number) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(getParserConfiguration(realInputPath));
    const results = await parser.calculateMetrics();
    expect(results.fileMetrics.get(realInputPath)?.get(metric)?.metricValue).toBe(expected);
}
