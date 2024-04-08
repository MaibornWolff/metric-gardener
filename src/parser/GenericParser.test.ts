import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GenericParser } from "./GenericParser.js";
import * as HelperModule from "./helper/Helper.js";
import * as TreeParser from "./helper/TreeParser.js";
import { getTestConfiguration, mockConsole } from "../../test/metric-end-results/TestHelper.js";
import {
    assumeLanguageFromFilePath,
    FileType,
    Language,
    languageToGrammar,
} from "./helper/Language.js";
import Parser = require("tree-sitter");
import { Tree } from "tree-sitter";
import {
    SourceFile,
    ParsedFile,
    UnsupportedFile,
    FileMetricResults,
    ErrorFile,
    MetricError,
    MetricResult,
} from "./metrics/Metric.js";
import * as MetricCalculator from "./MetricCalculator.js";
import { CouplingCalculator } from "./CouplingCalculator.js";
import { Configuration } from "./Configuration.js";
import path from "path";

/*
 * Implementation of function mocks:
 */

// eslint-disable-next-line @typescript-eslint/require-await
async function* mockedFindFilesAsync(): AsyncGenerator<string> {
    yield "clearly/invalid/path.cpp";
}

// eslint-disable-next-line @typescript-eslint/require-await
async function* mockedFindTwoFilesAsync(): AsyncGenerator<string> {
    yield "clearly/invalid/path1.cc";
    yield "clearly/invalid/path2.cpp";
}

// eslint-disable-next-line @typescript-eslint/require-await
async function* mockedFindAlsoUnsupportedFilesAsync(): AsyncGenerator<string> {
    yield "clearly/invalid/path1.cc";
    yield "clearly/invalid/unsupported.unsupported";
}

// eslint-disable-next-line @typescript-eslint/require-await
async function* mockedFindFilesAsyncError(): AsyncGenerator<string> {
    yield "clearly/invalid/path.cpp";
    throw new Error("Hard drive crashed!");
}

function mockedTreeParserParse(filePath: string, config: Configuration): Promise<SourceFile> {
    const language = assumeLanguageFromFilePath(filePath, config);
    if (language !== undefined) {
        return Promise.resolve(new ParsedFile(filePath, language, tree));
    } else {
        return Promise.resolve(new UnsupportedFile(filePath));
    }
}

function mockedMetricsCalculator(file: SourceFile): Promise<[SourceFile, FileMetricResults]> {
    if (file instanceof ErrorFile) {
        return Promise.resolve([
            file,
            { fileType: file.fileType, metricResults: [], metricErrors: [] },
        ]);
    } else {
        return Promise.resolve([file, expectedFileMetricsResults]);
    }
}

/*
 * Helper functions for creating mocks:
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mockFindFilesAsync(mockedFunction: () => AsyncGenerator<string> = mockedFindFilesAsync) {
    return vi.spyOn(HelperModule, "findFilesAsync").mockImplementation(mockedFunction);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mockTreeParserParse(
    implementation: (
        filePath: string,
        config: Configuration,
    ) => Promise<SourceFile> = mockedTreeParserParse,
) {
    return vi.spyOn(TreeParser, "parse").mockImplementation(implementation);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function spyOnMetricCalculator() {
    return vi.spyOn(MetricCalculator, "calculateMetrics");
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function spyOnCouplingCalculatorNoOp() {
    const couplingProcessFileSpied = vi
        .spyOn(CouplingCalculator.prototype, "processFile")
        .mockReset();
    const couplingCalculateSpied = vi
        .spyOn(CouplingCalculator.prototype, "calculateMetrics")
        .mockReturnValue({ relationships: [], metrics: new Map() });
    return { couplingProcessFileSpied, couplingCalculateSpied };
}

/*
 * Example data:
 */

const expectedFileMetricsResults: FileMetricResults = {
    fileType: FileType.SourceCode,
    metricResults: [{ metricName: "lines_of_code", metricValue: 5 }],
    metricErrors: [],
};

let tree: Tree;
beforeAll(() => {
    const parser = new Parser();
    parser.setLanguage(languageToGrammar.get(Language.CPlusPlus));
    tree = parser.parse("int main() { return 0; }");
});

describe("GenericParser.calculateMetrics()", () => {
    beforeEach(() => {
        mockConsole();
    });

    it("should call MetricCalculator.calculateMetrics() and return the result when there is no error", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        const treeParserSpied = mockTreeParserParse();

        const calculateMetricsSpied =
            spyOnMetricCalculator().mockImplementation(mockedMetricsCalculator);
        const { couplingProcessFileSpied, couplingCalculateSpied } = spyOnCouplingCalculatorNoOp();

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
        expect(couplingProcessFileSpied).toHaveBeenCalledTimes(1);
        expect(couplingCalculateSpied).toHaveBeenCalledTimes(1);
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
        const { couplingProcessFileSpied, couplingCalculateSpied } = spyOnCouplingCalculatorNoOp();

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
        expect(couplingProcessFileSpied).toHaveBeenCalledTimes(2);
        expect(couplingCalculateSpied).toHaveBeenCalledTimes(1);
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
        const { couplingProcessFileSpied, couplingCalculateSpied } = spyOnCouplingCalculatorNoOp();

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
        expect(couplingProcessFileSpied).toHaveBeenCalledTimes(2);
        expect(couplingCalculateSpied).toHaveBeenCalledTimes(1);
        expect(treeParserSpied).toHaveBeenCalledTimes(2);
    });

    it("should return the appropriate error object and print to the error output when there is an error while parsing the tree", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync();
        mockTreeParserParse((filePath) => {
            return Promise.resolve(new ErrorFile(filePath, new Error("Baaaaaah")));
        });

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
        expect(console.error).toHaveBeenCalled();
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
            metricErrors: [{ metricName: "lines_of_code", error: new Error("Buuuh!") }],
        };

        spyOnMetricCalculator().mockImplementation((file) => {
            return Promise.resolve([file, errorMetricsResults]);
        });

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
        expect(console.error).toHaveBeenCalled();
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
                    metricName: "lines_of_code",
                    error: new Error("I only accept cpp files!"),
                },
            ],
        };

        spyOnMetricCalculator().mockImplementation((file) => {
            if (path.posix.extname(file.filePath) !== ".cpp") {
                return Promise.resolve([file, errorMetricsResults]);
            } else {
                return Promise.resolve([file, expectedFileMetricsResults]);
            }
        });

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
        expect(console.error).toHaveBeenCalled();
    });

    it("should return the successfully calculated metrics and an appropriate error object when there is an error for only some of the metrics of a file", async () => {
        /*
         * Given:
         */
        mockFindFilesAsync(mockedFindTwoFilesAsync);
        mockTreeParserParse();

        const metricResults: MetricResult[] = [
            { metricName: "lines_of_code", metricValue: 5 },
            { metricName: "real_lines_of_code", metricValue: 3 },
        ];

        const metricErrors: MetricError[] = [
            {
                metricName: "classes",
                error: new Error("Classes metric is to difficult for this program!"),
            },
            {
                metricName: "functions",
                error: new Error("Unable to call functions, because, well, it does not work, ok??"),
            },
        ];

        const partialErrorMetricsResults: FileMetricResults = {
            fileType: FileType.SourceCode,
            metricResults,
            metricErrors,
        };

        spyOnMetricCalculator().mockImplementation(async (file) => {
            if (path.posix.extname(file.filePath) === ".cpp") {
                return Promise.resolve([file, partialErrorMetricsResults]);
            } else {
                return Promise.resolve([file, expectedFileMetricsResults]);
            }
        });

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
        expect(console.error).toHaveBeenCalled();
    });

    it("should fail if findFilesAsync throws an error", () => {
        mockFindFilesAsync(mockedFindFilesAsyncError);
        mockTreeParserParse();
        const parser = new GenericParser(getTestConfiguration("clearly/invalid/path.cpp"));

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(parser.calculateMetrics()).rejects.toThrowError("Hard drive crashed!");
        expect(console.error).not.toHaveBeenCalled();
    });
});
