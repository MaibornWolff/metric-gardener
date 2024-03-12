import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { ConfigurationParams, Configuration } from "../../src/parser/Configuration";
import { CouplingResult, FileMetric, MetricResult } from "../../src/parser/metrics/Metric";
import { strcmp } from "../../src/parser/helper/Helper";

/**
 * Gets a configuration for test cases.
 * @param sourcesPath Path to the source files.
 * @param customOverrides Partial {@link ConfigurationParams} object for overriding parts of the default test configuration.
 * @param formatFilePaths Whether to format the output file paths to be independent of project location and platform.
 * If set to true, it sets the necessary configuration options and may override custom overrides.
 * When using this option, do not forget to also format the file path when accessing metric results from the output.
 * You should use {@link formatPrintPath} for this, e.g.:
 * <pre><code>
 * results.fileMetrics.get(formatPrintPath(inputPath, config))
 * </code></pre>
 *
 * @return A configuration for testing purposes.
 */
export function getTestConfiguration(
    sourcesPath: string,
    customOverrides: Partial<ConfigurationParams> = {},
    formatFilePaths = false,
) {
    let configParams: ConfigurationParams = {
        sourcesPath: sourcesPath,
        outputPath: "invalid/output/path",
        parseDependencies: false,
        exclusions: "",
        parseAllHAsC: false,
        parseSomeHAsC: "",
        compress: false,
        relativePaths: false,
    };
    configParams = { ...configParams, ...customOverrides };

    if (formatFilePaths) {
        configParams.relativePaths = true;
        configParams.enforceBackwardSlash = true;
    }

    return new Configuration(configParams);
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
        [...couplingResult.metrics.entries()].sort((a, b) => strcmp(a[0], b[0])),
    );
    couplingResult.relationships.sort((a, b) => {
        // Unique ID for relationships adapted from metrics/coupling/Coupling.ts getRelationships(...)
        const uniqueIdA = a.toNamespace + a.fromNamespace;
        const uniqueIdB = b.toNamespace + b.fromNamespace;
        return strcmp(uniqueIdA, uniqueIdB);
    });
}

/**
 * Invokes the calculation of the file metrics for the specified file.
 * Tests if the file metric is calculated correctly.
 * @param inputPath Path to test source file.
 * @param metric Name of the metric.
 * @param expected Expected test result.
 * */
export async function parseAndTestFileMetric(
    inputPath: string,
    metric: FileMetric,
    expected: number,
) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(getTestConfiguration(realInputPath));
    const results = await parser.calculateMetrics();
    expect(results.fileMetrics.get(realInputPath)?.get(metric)?.metricValue).toBe(expected);
}

/**
 * Calculates all file metrics for all supported files that can be found under the specified input path.
 * @param inputPath Path to the source code files to parse.
 * @param parseHAsC Whether to parse all .h files as C instead of C++ files.
 * @return Map that maps the absolute file paths to the corresponding map of calculated file metric results.
 */
export async function parseAllFileMetrics(inputPath: string, parseHAsC = false) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(
        getTestConfiguration(realInputPath, { parseAllHAsC: parseHAsC }),
    );
    return (await parser.calculateMetrics()).fileMetrics;
}

/**
 * Tests if a specific metric for a specific source file has been calculated correctly.
 * @param results The actual results of the metric calculation.
 * Assumes that this map uses the absolute paths to the source files.
 * @param inputPath Relative or absolute path to test source file.
 * @param metric Name of the metric.
 * @param expected Expected metric value.
 * */
export function expectFileMetric(
    results: Map<string, Map<string, MetricResult>>,
    inputPath: string,
    metric: FileMetric,
    expected: number,
) {
    const realInputPath = fs.realpathSync(inputPath);
    expect(results.get(realInputPath)?.get(metric)?.metricValue).toBe(expected);
}

/**
 * Gets the metrics for the specified test source files.
 * @param inputPath Path to the test source files.
 * @return The calculated metrics.
 */
export async function getFileMetrics(inputPath: string) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(getTestConfiguration(realInputPath));
    return await parser.calculateMetrics();
}

/**
 * Gets the coupling metrics for the specified path.
 * @param inputPath Path to the test source files.
 */
export async function getCouplingMetrics(inputPath: string) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(
        getTestConfiguration(realInputPath, { parseDependencies: true }, true),
    );

    const results = await parser.calculateMetrics();
    const couplingResult = results.couplingMetrics;
    sortCouplingResults(couplingResult);

    return couplingResult;
}
