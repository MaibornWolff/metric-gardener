import { jest } from "@jest/globals";
import { MetricCalculator } from "./MetricCalculator";
import { getTestConfiguration, spyOnConsoleErrorNoOp } from "../../test/metric-end-results/TestHelper";
import { ErrorFile, FileMetric, FileMetricResults, ParsedFile, SourceFile, UnsupportedFile } from "./metrics/Metric";
import { FileType, Language, languageToGrammar } from "./helper/Language";
import Parser from "tree-sitter";
import { Classes } from "./metrics/Classes";
import { CommentLines } from "./metrics/CommentLines";
import { Complexity } from "./metrics/Complexity";
import { Functions } from "./metrics/Functions";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { MaxNestingLevel } from "./metrics/MaxNestingLevel";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { LinesOfCodeRawText } from "./metrics/LinesOfCodeRawText";

jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn(),
    },
}));

function initiateSpies() {
    jest.spyOn(Classes.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.classes,
        metricValue: 1,
    });
    jest.spyOn(CommentLines.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.commentLines,
        metricValue: 2,
    });
    jest.spyOn(Complexity.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.complexity,
        metricValue: 3,
    });
    jest.spyOn(Functions.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.functions,
        metricValue: 4,
    });
    jest.spyOn(LinesOfCode.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 5,
    });
    jest.spyOn(MaxNestingLevel.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.maxNestingLevel,
        metricValue: 6,
    });
    jest.spyOn(RealLinesOfCode.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.realLinesOfCode,
        metricValue: 7,
    });
    jest.spyOn(LinesOfCodeRawText, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 8,
    });
}

function initiateErrorSpies() {
    jest.spyOn(Classes.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating classes metric"),
    );
    jest.spyOn(CommentLines.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating commentlines metric"),
    );
    jest.spyOn(Complexity.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating complexity metric"),
    );
    jest.spyOn(Functions.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating functions metric"),
    );
    jest.spyOn(LinesOfCode.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating linesofcode metric"),
    );
    jest.spyOn(MaxNestingLevel.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating maxnestinglevel metric"),
    );
    jest.spyOn(RealLinesOfCode.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating reallinesofcode metric"),
    );
    jest.spyOn(LinesOfCodeRawText, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 8,
    });
}

describe("MetricCalculator.calculateMetrics()", () => {
    let metricCalculator: MetricCalculator;
    let parsedFile: ParsedFile;
    let parsedFilePromise: Promise<SourceFile>;
    let parser: Parser;
    let tree: Parser.Tree;

    beforeAll(() => {
        metricCalculator = new MetricCalculator(getTestConfiguration("clearly/invalid/path.cpp"));
        parser = new Parser();
    });

    beforeEach(() => {
        // Clear all mock implementations, reset them to original implementation:
        jest.restoreAllMocks();
        spyOnConsoleErrorNoOp();
    });

    it("should calculate all metrics of type source code for a python file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        tree = parser.parse("sum(range(4))");
        parsedFile = new ParsedFile("test.py", Language.Python, tree);
        parsedFilePromise = new Promise<ParsedFile>((resolve) => {
            resolve(parsedFile);
        });

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults.fileType).toEqual(FileType.SourceCode);
        expect(fileMetricResults.metricResults.get("classes")).toEqual({
            metricName: FileMetric.classes,
            metricValue: 1,
        });
        expect(fileMetricResults.metricResults.get("comment_lines")).toEqual({
            metricName: FileMetric.commentLines,
            metricValue: 2,
        });
        expect(fileMetricResults.metricResults.get("complexity")).toEqual({
            metricName: FileMetric.complexity,
            metricValue: 3,
        });
        expect(fileMetricResults.metricResults.get("functions")).toEqual({
            metricName: FileMetric.functions,
            metricValue: 4,
        });
        expect(fileMetricResults.metricResults.get("lines_of_code")).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 5,
        });
        expect(fileMetricResults.metricResults.get("real_lines_of_code")).toEqual({
            metricName: FileMetric.realLinesOfCode,
            metricValue: 7,
        });
        expect(fileMetricResults.metricResults.has("max_nesting_level")).toEqual(false);
    });

    it("should calculate lines of code and maximum nesting level for a JSON file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.JSON));
        tree = parser.parse('{ "a": { "b": "c" } }');
        parsedFile = new ParsedFile("test.json", Language.JSON, tree);
        parsedFilePromise = new Promise<ParsedFile>((resolve) => {
            resolve(parsedFile);
        });

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults.fileType).toEqual(FileType.StructuredText);
        expect(fileMetricResults.metricResults.has("classes")).toEqual(false);
        expect(fileMetricResults.metricResults.has("comment_lines")).toEqual(false);
        expect(fileMetricResults.metricResults.has("complexity")).toEqual(false);
        expect(fileMetricResults.metricResults.has("functions")).toEqual(false);
        expect(fileMetricResults.metricResults.get("lines_of_code")).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 5,
        });
        expect(fileMetricResults.metricResults.has("real_lines_of_code")).toEqual(false);
        expect(fileMetricResults.metricResults.get("max_nesting_level")).toEqual({
            metricName: FileMetric.maxNestingLevel,
            metricValue: 6,
        });
    });

    it("should calculate lines of code for a text file", async () => {
        // given
        const unsupportedFile = new UnsupportedFile("test.txt");
        const unsupportedFilePromise = new Promise<UnsupportedFile>((resolve) => {
            resolve(unsupportedFile);
        });

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(unsupportedFilePromise);

        // then
        expect(sourceFile).toEqual(unsupportedFile);
        expect(fileMetricResults.fileType).toEqual(FileType.Unsupported);
        expect(fileMetricResults.metricResults.has("classes")).toEqual(false);
        expect(fileMetricResults.metricResults.has("comment_lines")).toEqual(false);
        expect(fileMetricResults.metricResults.has("complexity")).toEqual(false);
        expect(fileMetricResults.metricResults.has("functions")).toEqual(false);
        expect(fileMetricResults.metricResults.get("lines_of_code")).toEqual({
            metricName: FileMetric.linesOfCode,
            metricValue: 8,
        });
        expect(fileMetricResults.metricResults.has("real_lines_of_code")).toEqual(false);
        expect(fileMetricResults.metricResults.has("max_nesting_level")).toEqual(false);
    });

    it("should return an empty map of metrics when the source file is an error file", async () => {
        // given
        const errorFile = new ErrorFile("/path/to/error/causing/file.js",
            new Error("Root node of syntax tree for file /path/to/error/causing/file.js is undefined!"));

        parsedFilePromise = new Promise<SourceFile>((resolve) => {
            resolve(errorFile);
        });

        // when
        const result = await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        const expectedResult: [SourceFile, FileMetricResults] = [errorFile, {fileType: FileType.Error, metricResults: new Map()}];
        expect(result).toEqual(expectedResult);

    });

    it("should include an error object in the result when an error is thrown while calculating any metric on a source file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        tree = parser.parse("sum(range(4))");
        parsedFile = new ParsedFile("test.py", Language.Python, tree);
        parsedFilePromise = new Promise<ParsedFile>((resolve) => {
            resolve(parsedFile);
        });

        initiateErrorSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults.fileType).toEqual(FileType.SourceCode);
        expect(fileMetricResults.error).toEqual(new Error("Error while calculating metric(s) for file " + sourceFile.filePath));
    });
});
