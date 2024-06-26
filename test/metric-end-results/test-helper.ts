import * as fs from "node:fs";
import path, { type PlatformPath } from "node:path";
import process from "node:process";
import { expect, vi } from "vitest";
import { GenericParser } from "../../src/parser/generic-parser.js";
import { type ConfigurationParameters, Configuration } from "../../src/parser/configuration.js";
import {
    type CouplingResult,
    type MetricName,
    type FileMetricResults,
} from "../../src/parser/metrics/metric.js";

/**
 * Gets a configuration for test cases.
 * @param sourcesPath Path to the source files.
 * @param customOverrides Partial {@link ConfigurationParameters} object for overriding parts of the default test configuration.
 *
 * @return A configuration for testing purposes.
 */
export function getTestConfiguration(
    sourcesPath: string,
    customOverrides: Partial<ConfigurationParameters> = {},
): Configuration {
    const defaultParameters: ConfigurationParameters = {
        sourcesPath,
        outputPath: "invalid/output/path",
        parseDependencies: false,
        exclusions: "",
        parseAllHAsC: false,
        parseSomeHAsC: "",
        compress: false,
        relativePaths: false,
    };
    return new Configuration({ ...defaultParameters, ...customOverrides });
}

export function mockConsole(): void {
    for (const key of Object.keys(console) as Array<keyof Console>) {
        vi.spyOn(console, key).mockReset();
    }

    vi.spyOn(process.stdout, "write").mockReset();
}

export function mockPosixPath({ skip }: { skip?: Array<keyof PlatformPath> } = {}): void {
    mockPath(path.posix, skip);
}

export function mockWin32Path({ skip }: { skip?: Array<keyof PlatformPath> } = {}): void {
    mockPath(path.win32, skip);
}

function mockPath(platformPath: PlatformPath, skip: Array<keyof PlatformPath> = []): void {
    for (const [key, value] of Object.entries(platformPath) as Array<
        [keyof PlatformPath, unknown]
    >) {
        if (skip.includes(key)) {
            continue;
        }

        if (typeof value === "function") {
            // @ts-expect-error TS cannot handle the check above
            vi.spyOn(path, key).mockImplementation(value);
        } else if (typeof value === "string") {
            // @ts-expect-error TS cannot handle the check above
            vi.spyOn(path, key, "get").mockReturnValue(value);
        }
    }
}

/**
 * Calculates all file metrics for all supported files that can be found under the specified input path.
 * @param inputPath Path to the source code files to parse.
 * @param parseHAsC Whether to parse all .h files as C instead of C++ files.
 * @return Map that maps the absolute file paths to the corresponding map of calculated file metric results.
 */
export async function parseAllFileMetrics(
    inputPath: string,
    parseHAsC = false,
): Promise<Map<string, FileMetricResults>> {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(
        getTestConfiguration(realInputPath, { parseAllHAsC: parseHAsC }),
    );
    const result = await parser.calculateMetrics();
    return result.fileMetrics;
}

/**
 * Tests if a specific metric for a specific source file has been calculated correctly.
 * @param results The actual results of the metric calculation.
 * Assumes that this map uses the absolute paths to the source files.
 * @param inputPath Relative or absolute path to test source file.
 * @param metric Name of the metric.
 * @param expected Expected metric value.
 */
export function expectFileMetric(
    results: Map<string, FileMetricResults>,
    inputPath: string,
    metric: MetricName,
    expected: number,
): void {
    const realInputPath = fs.realpathSync(inputPath);
    const metricResults = results.get(realInputPath)?.metricResults;
    const metricValue = metricResults?.find(({ metricName }) => metricName === metric)?.metricValue;
    expect(metricValue).toBe(expected);
}

/**
 * Gets the coupling metrics for the specified path.
 * @param inputPath Path to the test source files.
 */
export async function getCouplingMetrics(inputPath: string): Promise<CouplingResult> {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(
        getTestConfiguration(realInputPath, { parseDependencies: true, relativePaths: true }),
    );

    const results = await parser.calculateMetrics();
    const couplingResult = results.couplingMetrics;
    sortCouplingResults(couplingResult);

    return couplingResult;
}

/**
 * Sorts the contents of the specified {@link CouplingResult} in a deterministic way.
 * This is necessary as there can be deviations concerning the order
 * in which files are found on different platforms.
 * @param couplingResult The CouplingResult whose contents should be sorted.
 */
function sortCouplingResults(couplingResult: CouplingResult): void {
    // Sort the metrics in ascending order of the file paths
    couplingResult.metrics = new Map(
        [...couplingResult.metrics.entries()].sort((a, b) => strcmp(a[0], b[0])),
    );
    couplingResult.relationships.sort((a, b) => {
        // Unique ID for relationships adapted from metrics/coupling/Coupling.ts getRelationships(...)
        const uniqueIdA = (a.toFQTN as string) + (a.fromFQTN as string);
        const uniqueIdB = (b.toFQTN as string) + (b.fromFQTN as string);
        return strcmp(uniqueIdA, uniqueIdB);
    });
}

/**
 * Similar to strcmp in C, this compares two strings and returns a negative value if a < b, a positive value if b < a,
 * and 0 if a === b.
 * @param a First string.
 * @param b Second string.
 * @return negative value if a < b, a positive value if b < a, and 0 if a === b.
 */
function strcmp(a: string, b: string): 1 | 0 | -1 {
    if (a < b) {
        return -1;
    }

    if (b < a) {
        return 1;
    }

    return 0;
}
