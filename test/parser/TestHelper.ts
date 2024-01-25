import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { Configuration } from "../../src/parser/Configuration";

export async function testCalculateMetrics(inputPath: string, metric: string, expected: unknown) {
    const realInputPath = fs.realpathSync(inputPath);
    const parser = new GenericParser(getParserConfiguration(realInputPath));
    const results = await parser.calculateMetrics();
    expect(results.fileMetrics.get(realInputPath)?.get(metric)?.metricValue).toBe(expected);
}

//TODO: this is duplicated from GenericParser.test.ts, pls delete this function in that file.
function getParserConfiguration(
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
