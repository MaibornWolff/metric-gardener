import { expect, jest } from "@jest/globals";
import { GenericParser } from "./GenericParser";
import { findFilesAsync } from "./helper/Helper";
import { TreeParser } from "./helper/TreeParser";
import { getParserConfiguration } from "../../test/metric-end-results/TestHelper";
import { Language, languageToGrammar } from "./helper/Language";
import Parser from "tree-sitter";
import { FileMetric } from "./metrics/Metric";
import { MetricCalculator } from "./MetricCalculator";

jest.mock("./CouplingCalculator");
jest.mock("./helper/Helper");
jest.mock("./helper/TreeParser");
jest.mock("./MetricCalculator");

async function* mockedFindFilesAsync() {
    yield { fileExtension: "cpp", filePath: "clearly/invalid/path.cpp" };
}

async function* mockedFindTwoFiles() {
    yield { fileExtension: "cc", filePath: "clearly/invalid/path1.cc" };
    yield { fileExtension: "cpp", filePath: "clearly/invalid/path2.cpp" };
}

async function* mockedErrorFindFilesAsync() {
    yield { fileExtension: "cpp", filePath: "clearly/invalid/path.cpp" };
    throw new Error("Hard drive crashed!");
}

let parser: Parser;
let tree: Parser.Tree;

beforeAll(() => {
    parser = new Parser();
    parser.setLanguage(languageToGrammar.get(Language.CPlusPlus));
    tree = parser.parse("int main() { return 0; }");
});

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe("GenericParser.calculateMetrics() unit tests", () => {
    it("should return the correct value and call the appropriate functions in case there is no error", async () => {
        const expectedFileMetricsMap = new Map([
            [FileMetric.linesOfCode, { metricName: FileMetric.linesOfCode, metricValue: 5 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedFindFilesAsync();
        });

        const treeParserSpied = jest
            .spyOn(TreeParser, "parse")
            .mockImplementation((file, assumedLanguage) => {
                return Promise.resolve({
                    fileExtension: "cpp",
                    filePath: "clearly/invalid/path.cpp",
                    language: Language.CPlusPlus,
                    tree: tree,
                });
            });

        const calculateMetricsSpied = jest
            .spyOn(MetricCalculator.prototype, "calculateMetrics")
            .mockResolvedValue(["clearly/invalid/path.cpp", expectedFileMetricsMap]);

        const parser = new GenericParser(getParserConfiguration("clearly/invalid/path.cpp"));
        const actualResult = await parser.calculateMetrics();

        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedFileMetricsMap]])
        );
        expect(calculateMetricsSpied).toHaveBeenCalledTimes(1);
        expect(treeParserSpied).toHaveBeenCalledTimes(1);
    });

    it("should return the appropriate values and call the appropriate functions in case there is no error and two files are found", async () => {
        const expectedFileMetricsMap = new Map([
            [FileMetric.linesOfCode, { metricName: FileMetric.linesOfCode, metricValue: 5 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedFindTwoFiles();
        });

        const treeParserSpied = jest
            .spyOn(TreeParser, "parse")
            .mockImplementation((file, assumedLanguage) => {
                return Promise.resolve({
                    fileExtension: file.fileExtension,
                    filePath: file.filePath,
                    language: Language.CPlusPlus,
                    tree: tree,
                });
            });

        const calculateMetricsSpied = jest
            .spyOn(MetricCalculator.prototype, "calculateMetrics")
            .mockImplementation(async (parsedFilePromise) => [
                (await parsedFilePromise).filePath,
                expectedFileMetricsMap,
            ]);

        const parser = new GenericParser(getParserConfiguration("clearly/invalid"));
        const actualResult = await parser.calculateMetrics();

        expect(actualResult.fileMetrics).toEqual(
            new Map([
                ["clearly/invalid/path1.cc", expectedFileMetricsMap],
                ["clearly/invalid/path2.cpp", expectedFileMetricsMap],
            ])
        );
        expect(calculateMetricsSpied).toHaveBeenCalledTimes(2);
        expect(treeParserSpied).toHaveBeenCalledTimes(2);
    });

    it("should return the appropriate value and call the appropriate functions in case there is an error while parsing the tree", async () => {
        const expectedFileMetricsMap = new Map([
            ["ERROR", { metricName: "ERROR", metricValue: -1 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedFindFilesAsync();
        });

        jest.spyOn(TreeParser, "parse").mockImplementation(async (file, assumedLanguage) => {
            throw new Error("Baaaaaah");
        });

        jest.spyOn(MetricCalculator.prototype, "calculateMetrics").mockResolvedValue([
            "clearly/invalid/path.cpp",
            expectedFileMetricsMap,
        ]);

        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {
            /* Do nothing */
        });

        const parser = new GenericParser(getParserConfiguration("clearly/invalid/path.cpp"));
        const actualResult = await parser.calculateMetrics();

        // TODO: do no longer include errors into the list of results, use "info" field instead.
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedFileMetricsMap]])
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should return the appropriate value and call the appropriate functions in case there is an error while calculating metrics", async () => {
        const expectedFileMetricsMap = new Map([
            ["ERROR", { metricName: "ERROR", metricValue: -1 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedFindFilesAsync();
        });

        const treeParserSpied = jest
            .spyOn(TreeParser, "parse")
            .mockImplementation((file, assumedLanguage) => {
                return Promise.resolve({
                    fileExtension: file.fileExtension,
                    filePath: file.filePath,
                    language: Language.CPlusPlus,
                    tree: tree,
                });
            });

        jest.spyOn(MetricCalculator.prototype, "calculateMetrics").mockImplementation(
            async (parsedFilePromise) => {
                await parsedFilePromise;
                throw new Error("Buuuh!");
            }
        );

        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {
            /* Do nothing */
        });

        const parser = new GenericParser(getParserConfiguration("clearly/invalid/path.cpp"));
        const actualResult = await parser.calculateMetrics();

        // TODO: do no longer include errors into the list of results, use "info" field instead.
        expect(actualResult.fileMetrics).toEqual(
            new Map([["clearly/invalid/path.cpp", expectedFileMetricsMap]])
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should perform the appropriate actions in case there is an error for only the first of two files while calculating metrics", async () => {
        const expectedFileMetricsMap = new Map([
            [FileMetric.linesOfCode, { metricName: FileMetric.linesOfCode, metricValue: 5 }],
        ]);
        const expectedErrorMetricsMap = new Map([
            ["ERROR", { metricName: "ERROR", metricValue: -1 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedFindTwoFiles();
        });

        const treeParserSpied = jest
            .spyOn(TreeParser, "parse")
            .mockImplementation((file, assumedLanguage) => {
                return Promise.resolve({
                    fileExtension: file.fileExtension,
                    filePath: file.filePath,
                    language: Language.CPlusPlus,
                    tree: tree,
                });
            });

        const calculateMetricsSpied = jest
            .spyOn(MetricCalculator.prototype, "calculateMetrics")
            .mockImplementation(async (parsedFilePromise) => {
                const file = await parsedFilePromise;
                if (file.fileExtension !== "cpp") {
                    throw new Error("I only accept cpp files!");
                }
                return [file.filePath, expectedFileMetricsMap];
            });

        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {
            /* Do nothing */
        });

        const parser = new GenericParser(getParserConfiguration("clearly/invalid"));
        const actualResult = await parser.calculateMetrics();

        expect(actualResult.fileMetrics).toEqual(
            new Map([
                ["clearly/invalid/path1.cc", expectedErrorMetricsMap],
                ["clearly/invalid/path2.cpp", expectedFileMetricsMap],
            ])
        );
        expect(errorSpy).toHaveBeenCalled();
    });

    it("should fail gracefully if findFilesAsync throws an error", async () => {
        const expectedFileMetricsMap = new Map([
            ["ERROR", { metricName: "ERROR", metricValue: -1 }],
        ]);

        const findFilesAsyncMock = findFilesAsync as jest.Mocked<typeof findFilesAsync>;
        findFilesAsyncMock.mockImplementation((config) => {
            return mockedErrorFindFilesAsync();
        });

        jest.spyOn(TreeParser, "parse").mockImplementation((file, assumedLanguage) => {
            return Promise.resolve({
                fileExtension: "cpp",
                filePath: "clearly/invalid/path.cpp",
                language: Language.CPlusPlus,
                tree: tree,
            });
        });

        jest.spyOn(MetricCalculator.prototype, "calculateMetrics").mockResolvedValue([
            "clearly/invalid/path.cpp",
            expectedFileMetricsMap,
        ]);

        const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {
            /* Do nothing */
        });

        const parser = new GenericParser(getParserConfiguration("clearly/invalid/path.cpp"));
        const actualResult = await parser.calculateMetrics();

        expect(actualResult.fileMetrics).toEqual(new Map());
        expect(errorSpy).toHaveBeenCalled();
    });
});
