import { beforeAll, describe, expect, it, vi } from "vitest";
import { GenericParser } from "./GenericParser.js";
import { getFileExtension } from "./helper/Helper.js";
import * as HelperModule from "./helper/Helper.js";
import { TreeParser } from "./helper/TreeParser.js";
import { getTestConfiguration, mockConsole } from "../../test/metric-end-results/TestHelper.js";
import {
    assumeLanguageFromFilePath,
    FileType,
    Language,
    languageToGrammar,
} from "./helper/Language.js";
import Parser = require("tree-sitter");
import {
    SourceFile,
    FileMetric,
    ParsedFile,
    UnsupportedFile,
    FileMetricResults,
    ErrorFile,
    MetricError,
    MetricResult,
} from "./metrics/Metric.js";
import { MetricCalculator } from "./MetricCalculator.js";
import { CouplingCalculator } from "./CouplingCalculator.js";
import { Configuration } from "./Configuration.js";

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
    const language = assumeLanguageFromFilePath(filePath, config);
    if (language !== undefined) {
        return Promise.resolve(new ParsedFile(filePath, language, tree));
    } else {
        return new UnsupportedFile(filePath);
    }
}

async function mockedMetricsCalculator(
    parsedFilePromise: Promise<SourceFile>,
): Promise<[SourceFile, FileMetricResults]> {
    const file = await parsedFilePromise;
    if (file instanceof ErrorFile) {
        return [file, { fileType: file.fileType, metricResults: [], metricErrors: [] }];
    }
    return [file, expectedFileMetricsResults];
}

/*
 * Helper functions for creating mocks:
 */

function mockFindFilesAsync(mockedFunction: () => AsyncGenerator<string> = mockedFindFilesAsync) {
    return vi.spyOn(HelperModule, "findFilesAsync").mockImplementation(mockedFunction);
}

function mockTreeParserParse(
    implementation: (
        filePath: string,
        config: Configuration,
    ) => Promise<ParsedFile | UnsupportedFile> = mockedTreeParserParse,
) {
    return vi.spyOn(TreeParser, "parse").mockImplementation(implementation);
}

function spyOnMetricCalculator() {
    return vi.spyOn(MetricCalculator.prototype, "calculateMetrics");
}

function spyOnCouplingCalculatorNoOp() {
    return vi
        .spyOn(CouplingCalculator.prototype, "calculateMetrics")
        .mockReturnValue({ relationships: [], metrics: new Map() });
}

/*
 * Example data:
 */

const expectedFileMetricsResults: FileMetricResults = {
    fileType: FileType.SourceCode,
    metricResults: [{ metricName: FileMetric.linesOfCode, metricValue: 5 }],
    metricErrors: [],
};

let tree: Parser.Tree;
beforeAll(() => {
    const parser = new Parser();
    parser.setLanguage(languageToGrammar.get(Language.CPlusPlus));
    tree = parser.parse("int main() { return 0; }");
});

describe("GenericParser.calculateMetrics()", () => {
    it("should call MetricCalculator.calculateMetrics() and return the result when there is no error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        const treeParserSpied = mockTreeParserParse();

        const calculateMetricsSpied =
            spyOnMetricCalculator().mockImplementation(mockedMetricsCalculator);
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
            new Map([["clearly/invalid/path.cpp", expectedFileMetricsResults]]),
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
                ["clearly/invalid/path1.cc", expectedFileMetricsResults],
                ["clearly/invalid/path2.cpp", expectedFileMetricsResults],
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
                ["clearly/invalid/path1.cc", expectedFileMetricsResults],
                ["clearly/invalid/unsupported.unsupported", expectedFileMetricsResults],
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
        await parser.calculateMetrics();
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
        mockTreeParserParse(async (filePath) => {
            return new ErrorFile(filePath, new Error("Baaaaaah"));
        });

        const errorSpy = mockConsole().error;

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));
        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(new Map());
        expect(actualResult.errorFiles).toEqual(["clearly/invalid/path.cpp"]);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the appropriate error object and print to the error output when there is an error while calculating metrics", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        mockTreeParserParse();

        const errorMetricsResults: FileMetricResults = {
            fileType: FileType.SourceCode,
            metricResults: [],
            metricErrors: [{ metricName: FileMetric.linesOfCode, error: new Error("Buuuh!") }],
        };

        spyOnMetricCalculator().mockImplementation(async (parsedFilePromise) => {
            return [await parsedFilePromise, errorMetricsResults];
        });

        const errorSpy = mockConsole().error;

        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));

        /*
         * when:
         */
        const actualResult = await parser.calculateMetrics();
        /*
         * then:
         */
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", errorMetricsResults]]),
        );
        expect(actualResult.errorFiles).toEqual([]);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the successfully calculated metrics and an appropriate error object when there is an error for only the first of two files while calculating metrics", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        mockTreeParserParse();

        const errorMetricsResults: FileMetricResults = {
            fileType: FileType.SourceCode,
            metricResults: [],
            metricErrors: [
                {
                    metricName: FileMetric.linesOfCode,
                    error: new Error("I only accept cpp files!"),
                },
            ],
        };

        spyOnMetricCalculator().mockImplementation(async (parsedFilePromise) => {
            const file = await parsedFilePromise;
            if (getFileExtension(file.filePath) !== "cpp") {
                return [file, errorMetricsResults];
            }
            return [file, expectedFileMetricsResults];
        });

        const errorSpy = mockConsole().error;

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
                ["clearly/invalid/path2.cpp", expectedFileMetricsResults],
                ["clearly/invalid/path1.cc", errorMetricsResults],
            ]),
        );
        expect(actualResult.errorFiles).toEqual([]);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the successfully calculated metrics and an appropriate error object when there is an error for only some of the metrics of a file", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        mockTreeParserParse();

        const metricResults: MetricResult[] = [
            { metricName: FileMetric.linesOfCode, metricValue: 5 },
            { metricName: FileMetric.realLinesOfCode, metricValue: 3 },
        ];

        const metricErrors: MetricError[] = [
            {
                metricName: FileMetric.classes,
                error: new Error("Classes metric is to difficult for this program!"),
            },
            {
                metricName: FileMetric.functions,
                error: new Error("Unable to call functions, because, well, it does not work, ok??"),
            },
        ];

        const partialErrorMetricsResults: FileMetricResults = {
            fileType: FileType.SourceCode,
            metricResults,
            metricErrors,
        };

        spyOnMetricCalculator().mockImplementation(async (parsedFilePromise) => {
            const file = await parsedFilePromise;
            if (getFileExtension(file.filePath) === "cpp") {
                return [file, partialErrorMetricsResults];
            }
            return [file, expectedFileMetricsResults];
        });

        const errorSpy = mockConsole().error;

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
                ["clearly/invalid/path2.cpp", partialErrorMetricsResults],
                ["clearly/invalid/path1.cc", expectedFileMetricsResults],
            ]),
        );
        expect(actualResult.errorFiles).toEqual([]);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should fail gracefully if findFilesAsync throws an error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindFilesAsyncError);
        mockTreeParserParse();

        const errorSpy = mockConsole().error;

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
