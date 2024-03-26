import { MetricCalculator } from "./MetricCalculator";
import {
    expectError,
    expectMetric,
    expectNoError,
    expectNoMetric,
    spyOnConsoleErrorNoOp,
} from "../../test/metric-end-results/TestHelper";
import {
    ErrorFile,
    FileMetric,
    FileMetricResults,
    ParsedFile,
    SourceFile,
    UnsupportedFile,
} from "./metrics/Metric";
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

vi.mock("fs", () => ({
    promises: {
        readFile: vi.fn(),
    },
}));

function initiateSpies() {
    vi.spyOn(Classes.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.classes,
        metricValue: 1,
    });
    vi.spyOn(CommentLines.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.commentLines,
        metricValue: 2,
    });
    vi.spyOn(Complexity.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.complexity,
        metricValue: 3,
    });
    vi.spyOn(Functions.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.functions,
        metricValue: 4,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 5,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.maxNestingLevel,
        metricValue: 6,
    });
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.realLinesOfCode,
        metricValue: 7,
    });
    vi.spyOn(LinesOfCodeRawText, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 8,
    });
}

function initiateErrorSpies() {
    vi.spyOn(Classes.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating classes metric"),
    );
    vi.spyOn(CommentLines.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating commentLines metric"),
    );
    vi.spyOn(Complexity.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating complexity metric"),
    );
    vi.spyOn(Functions.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.functions,
        metricValue: 1,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockResolvedValue({
        metricName: FileMetric.linesOfCode,
        metricValue: 2,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating maxNestingLevel metric"),
    );
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockRejectedValue(
        new Error("something went wrong when calculating realLinesOfCode metric"),
    );
    vi.spyOn(LinesOfCodeRawText, "calculate").mockResolvedValue({
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
        metricCalculator = new MetricCalculator();
        parser = new Parser();
    });

    beforeEach(() => {
        // Clear all mock implementations, reset them to original implementation:
        vi.restoreAllMocks();
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
        expectMetric(fileMetricResults, FileMetric.classes, 1);
        expectMetric(fileMetricResults, FileMetric.commentLines, 2);
        expectMetric(fileMetricResults, FileMetric.complexity, 3);
        expectMetric(fileMetricResults, FileMetric.functions, 4);
        expectMetric(fileMetricResults, FileMetric.linesOfCode, 5);
        expectMetric(fileMetricResults, FileMetric.realLinesOfCode, 7);
        expectNoMetric(fileMetricResults, FileMetric.maxNestingLevel);
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
        expectNoMetric(fileMetricResults, FileMetric.classes);
        expectNoMetric(fileMetricResults, FileMetric.commentLines);
        expectNoMetric(fileMetricResults, FileMetric.complexity);
        expectNoMetric(fileMetricResults, FileMetric.functions);
        expectMetric(fileMetricResults, FileMetric.linesOfCode, 5);
        expectNoMetric(fileMetricResults, FileMetric.realLinesOfCode);
        expectMetric(fileMetricResults, FileMetric.maxNestingLevel, 6);
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
        expectNoMetric(fileMetricResults, FileMetric.classes);
        expectNoMetric(fileMetricResults, FileMetric.commentLines);
        expectNoMetric(fileMetricResults, FileMetric.complexity);
        expectNoMetric(fileMetricResults, FileMetric.functions);
        expectMetric(fileMetricResults, FileMetric.linesOfCode, 8);
        expectNoMetric(fileMetricResults, FileMetric.realLinesOfCode);
        expectNoMetric(fileMetricResults, FileMetric.maxNestingLevel);
    });

    it("should return an empty map of metrics when the source file is an error file", async () => {
        // given
        const errorFile = new ErrorFile(
            "/path/to/error/causing/file.js",
            new Error(
                "Root node of syntax tree for file /path/to/error/causing/file.js is undefined!",
            ),
        );

        parsedFilePromise = new Promise<SourceFile>((resolve) => {
            resolve(errorFile);
        });

        // when
        const result = await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        const expectedResult: [SourceFile, FileMetricResults] = [
            errorFile,
            { fileType: FileType.Error, metricResults: [], metricErrors: [] },
        ];
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
        expectNoMetric(fileMetricResults, FileMetric.classes);
        expectNoMetric(fileMetricResults, FileMetric.commentLines);
        expectNoMetric(fileMetricResults, FileMetric.complexity);
        expectMetric(fileMetricResults, FileMetric.functions, 1);
        expectMetric(fileMetricResults, FileMetric.linesOfCode, 2);
        expectNoMetric(fileMetricResults, FileMetric.realLinesOfCode);
        expectNoMetric(fileMetricResults, FileMetric.maxNestingLevel);

        expectError(
            fileMetricResults,
            FileMetric.classes,
            new Error("something went wrong when calculating classes metric"),
        );
        expectError(
            fileMetricResults,
            FileMetric.commentLines,
            new Error("something went wrong when calculating commentLines metric"),
        );
        expectError(
            fileMetricResults,
            FileMetric.complexity,
            new Error("something went wrong when calculating complexity metric"),
        );
        expectNoError(fileMetricResults, FileMetric.functions);
        expectNoError(fileMetricResults, FileMetric.linesOfCode);
        expectError(
            fileMetricResults,
            FileMetric.realLinesOfCode,
            new Error("something went wrong when calculating realLinesOfCode metric"),
        );

        // Should not have been tried to calculate on source code in the first place:
        expectNoMetric(fileMetricResults, FileMetric.maxNestingLevel);
    });
});
