import { expect, jest } from "@jest/globals";
import { GenericParser } from "./GenericParser";
import { getFileExtension } from "./helper/Helper";
import * as HelperModule from "./helper/Helper";
import { TreeParser } from "./helper/TreeParser";
import { getTestConfiguration } from "../../test/metric-end-results/TestHelper";
import { assumeLanguageFromFilePath, Language, languageToGrammar } from "./helper/Language";
import Parser from "tree-sitter";
import {
    SourceFile,
    FileMetric,
    MetricResult,
    ParsedFile,
    UnsupportedFile,
} from "./metrics/Metric";
import { MetricCalculator } from "./MetricCalculator";
import { CouplingCalculator } from "./CouplingCalculator";
import { Configuration } from "./Configuration";

/*
 * Implementation of function mocks:
 */
async function* mockedFindFilesAsync() {
    yield "clearly/invalid/path.cpp";
}

async function* mockedFindTwoFilesAsync() {
    yield "clearly/invalid/path1.cc";
    yield "clearly/invalid/path2.cpp";
}

async function* mockedFindAlsoUnsupportedFilesAsync() {
    yield "clearly/invalid/path1.cc";
    yield "clearly/invalid/unsupported.unsupported";
}

async function* mockedFindFilesAsyncError() {
    yield "clearly/invalid/path.cpp";
    throw new Error("Hard drive crashed!");
}

async function mockedTreeParserParse(filePath: string, config: Configuration) {
    return Promise.resolve({
        filePath: filePath,
        language: assumeLanguageFromFilePath(filePath, config),
        tree: tree,
    });
}

async function mockedMetricsCalculator(
    parsedFilePromise: Promise<SourceFile | null>,
): Promise<[string, Map<string, MetricResult>]> {
    const file = await parsedFilePromise;
    if (file !== null) {
        return [file.filePath, expectedFileMetricsMap];
    }
    throw new Error("Baaah");
}

/*
 * Helper functions for creating mocks:
 */

function mockFindFilesAsync(mockedFunction: () => AsyncGenerator<string> = mockedFindFilesAsync) {
    return jest.spyOn(HelperModule, "findFilesAsync").mockImplementation((config) => {
        return mockedFunction();
    });
}

function mockTreeParserParse(
    implementation: (
        filePath: string,
        config: Configuration,
    ) => Promise<ParsedFile | UnsupportedFile> = mockedTreeParserParse,
) {
    return jest.spyOn(TreeParser, "parse").mockImplementation(implementation);
}

function spyOnMetricCalculator() {
    return jest.spyOn(MetricCalculator.prototype, "calculateMetrics");
}

function spyOnCouplingCalculatorNoOp() {
    return jest
        .spyOn(CouplingCalculator.prototype, "calculateMetrics")
        .mockReturnValue({ relationships: [], metrics: new Map() });
}

function spyOnConsoleErrorNoOp() {
    return jest.spyOn(console, "error").mockImplementation(() => {
        /* Do nothing */
    });
}

/*
 * Example data:
 */

const expectedFileMetricsMap = new Map([
    [FileMetric.linesOfCode, { metricName: FileMetric.linesOfCode, metricValue: 5 }],
]);

const expectedErrorMetricsMap = new Map([["ERROR", { metricName: "ERROR", metricValue: -1 }]]);

let parser: Parser;
let tree: Parser.Tree;

beforeAll(() => {
    parser = new Parser();
    parser.setLanguage(languageToGrammar.get(Language.CPlusPlus));
    tree = parser.parse("int main() { return 0; }");
});

describe("GenericParser.calculateMetrics()", () => {
    beforeEach(() => {
        // Clear all mock implementations, reset them to original implementation:
        jest.restoreAllMocks();
    });

    it("should call MetricCalculator.calculateMetrics() and return the result when there is no error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        const treeParserSpied = mockTreeParserParse();

        const calculateMetricsSpied = spyOnMetricCalculator().mockResolvedValue([
            "clearly/invalid/path.cpp",
            expectedFileMetricsMap,
        ]);
        const couplingSpied = spyOnCouplingCalculatorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedFileMetricsMap]]),
        );
        expect(calculateMetricsSpied).toHaveBeenCalledTimes(1);
        expect(couplingSpied).toHaveBeenCalledTimes(0);
        expect(treeParserSpied).toHaveBeenCalledTimes(1);
    });

    it("should call MetricCalculator.calculateMetrics() and return the result when multiple files are found and there is no error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        const treeParserSpied = mockTreeParserParse();

        const calculateMetricsSpied =
            spyOnMetricCalculator().mockImplementation(mockedMetricsCalculator);
        const couplingSpied = spyOnCouplingCalculatorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(
            new Map([
                ["clearly/invalid/path1.cc", expectedFileMetricsMap],
                ["clearly/invalid/path2.cpp", expectedFileMetricsMap],
            ]),
        );
        expect(calculateMetricsSpied).toHaveBeenCalledTimes(2);
        expect(couplingSpied).toHaveBeenCalledTimes(0);
        expect(treeParserSpied).toHaveBeenCalledTimes(2);
    });

    it("should call MetricCalculator.calculateMetrics() and also return an entry in unknownFiles when unsupported files are found", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindAlsoUnsupportedFilesAsync);
        const treeParserSpied = mockTreeParserParse();

        const calculateMetricsSpied =
            spyOnMetricCalculator().mockImplementation(mockedMetricsCalculator);
        const couplingSpied = spyOnCouplingCalculatorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(
            new Map([
                ["clearly/invalid/path1.cc", expectedFileMetricsMap],
                ["clearly/invalid/unsupported.unsupported", expectedFileMetricsMap],
            ]),
        );
        expect(actualResult.unsupportedFiles).toEqual(["clearly/invalid/unsupported.unsupported"]);

        expect(calculateMetricsSpied).toHaveBeenCalledTimes(2);
        expect(couplingSpied).toHaveBeenCalledTimes(0);
        expect(treeParserSpied).toHaveBeenCalledTimes(2);
    });

    it("should call CouplingCalculator.calculateMetrics() when parseDependencies is set.", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        const treeParserSpied = mockTreeParserParse();
        const calculateMetricsSpied =
            spyOnMetricCalculator().mockImplementation(mockedMetricsCalculator);
        const couplingSpied = spyOnCouplingCalculatorNoOp();

        const parser = new GenericParser(
            getTestConfiguration("clearly/invalid/path.cpp", { parseDependencies: true }),
        );
        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(calculateMetricsSpied).toHaveBeenCalledTimes(2);
        expect(couplingSpied).toHaveBeenCalledTimes(1);
        expect(treeParserSpied).toHaveBeenCalledTimes(2);
    });

    it("should return the appropriate error object and print to the error output when there is an error while parsing the tree", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        mockTreeParserParse(async (file, assumedLanguage) => {
            throw new Error("Baaaaaah");
        });

        const errorSpy = spyOnConsoleErrorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));
        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        // TODO: do no longer include errors into the list of results, use "info" field instead #185
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedErrorMetricsMap]]),
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the appropriate error object and print to the error output when there is an error while calculating metrics", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        mockTreeParserParse();

        spyOnMetricCalculator().mockImplementation(async (parsedFilePromise) => {
            await parsedFilePromise;
            throw new Error("Buuuh!");
        });

        const errorSpy = spyOnConsoleErrorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        // TODO: do no longer include errors into the list of results, use "info" field instead #185
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedErrorMetricsMap]]),
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the successfully calculated metrics and an appropriate error object when there is an error for only the first of two files while calculating metrics", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        mockTreeParserParse();

        spyOnMetricCalculator().mockImplementation(async (parsedFilePromise) => {
            const file = await parsedFilePromise;
            if (file === null || getFileExtension(file.filePath) !== "cpp") {
                throw new Error("I only accept cpp files!");
            }
            return [file.filePath, expectedFileMetricsMap];
        });

        const errorSpy = spyOnConsoleErrorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        // TODO: do no longer include errors into the list of results, use "info" field instead #185
        expect(actualResult.fileMetrics).toEqual(
            new Map([
                ["clearly/invalid/path1.cc", expectedErrorMetricsMap],
                ["clearly/invalid/path2.cpp", expectedFileMetricsMap],
            ]),
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should fail gracefully if findFilesAsync throws an error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindFilesAsyncError);
        mockTreeParserParse();

        const errorSpy = spyOnConsoleErrorNoOp();

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(new Map());
        expect(errorSpy).toHaveBeenCalled();
    });
});
