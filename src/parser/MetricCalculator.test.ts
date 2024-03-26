import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MetricCalculator } from "./MetricCalculator.js";
import { mockConsole } from "../../test/metric-end-results/TestHelper.js";
import {
    ErrorFile,
    FileMetric,
    FileMetricResults,
    ParsedFile,
    SourceFile,
    UnsupportedFile,
} from "./metrics/Metric.js";
import { FileType, Language, languageToGrammar } from "./helper/Language.js";
import Parser = require("tree-sitter");
import { Classes } from "./metrics/Classes.js";
import { CommentLines } from "./metrics/CommentLines.js";
import { Complexity } from "./metrics/Complexity.js";
import { Functions } from "./metrics/Functions.js";
import { LinesOfCode } from "./metrics/LinesOfCode.js";
import { MaxNestingLevel } from "./metrics/MaxNestingLevel.js";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode.js";
import { LinesOfCodeRawText } from "./metrics/LinesOfCodeRawText.js";
import fs from "fs/promises";

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
    let parser: Parser;

    beforeAll(() => {
        metricCalculator = new MetricCalculator();
        parser = new Parser();
    });

    beforeEach(() => {
        vi.spyOn(fs, "readFile").mockReset();
        mockConsole();
    });

    it("should calculate all metrics of type source code for a python file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = Promise.resolve(parsedFile);

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code and maximum nesting level for a JSON file", async () => {
        // given
        parser.setLanguage(languageToGrammar.get(Language.JSON));
        const tree = parser.parse('{ "a": { "b": "c" } }');
        const parsedFile = new ParsedFile("test.json", Language.JSON, tree);
        const parsedFilePromise = Promise.resolve(parsedFile);

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code for a text file", async () => {
        // given
        const unsupportedFile = new UnsupportedFile("test.txt");
        const unsupportedFilePromise = Promise.resolve(unsupportedFile);

        initiateSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(unsupportedFilePromise);

        // then
        expect(sourceFile).toEqual(unsupportedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should return an empty map of metrics when the source file is an error file", async () => {
        // given
        const errorFile = new ErrorFile(
            "/path/to/error/causing/file.js",
            new Error(
                "Root node of syntax tree for file /path/to/error/causing/file.js is undefined!",
            ),
        );

        const errorFilePromise = Promise.resolve(errorFile);

        // when
        const result = await metricCalculator.calculateMetrics(errorFilePromise);

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
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = Promise.resolve(parsedFile);

        initiateErrorSpies();

        // when
        const [sourceFile, fileMetricResults] =
            await metricCalculator.calculateMetrics(parsedFilePromise);

        // then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });
});
