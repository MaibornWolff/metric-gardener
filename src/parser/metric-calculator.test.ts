import fs from "node:fs/promises";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import Parser = require("tree-sitter");
import { mockConsole } from "../../test/metric-end-results/test-helper.js";
import { calculateMetrics } from "./metric-calculator.js";
import {
    ErrorFile,
    type FileMetricResults,
    ParsedFile,
    type SourceFile,
    UnsupportedFile,
} from "./metrics/metric.js";
import { FileType, Language, languageToGrammar } from "./helper/language.js";
import { Classes } from "./metrics/classes.js";
import { CommentLines } from "./metrics/comment-lines.js";
import { Complexity } from "./metrics/complexity.js";
import { Functions } from "./metrics/functions.js";
import { LinesOfCode } from "./metrics/lines-of-code.js";
import { MaxNestingLevel } from "./metrics/max-nesting-level.js";
import { RealLinesOfCode } from "./metrics/real-lines-of-code.js";
import * as LinesOfCodeRawText from "./metrics/lines-of-code-raw-text.js";

function initiateSpies(): void {
    vi.spyOn(Classes.prototype, "calculate").mockReturnValue({
        metricName: "classes",
        metricValue: 1,
    });
    vi.spyOn(CommentLines.prototype, "calculate").mockReturnValue({
        metricName: "comment_lines",
        metricValue: 2,
    });
    vi.spyOn(Complexity.prototype, "calculate").mockReturnValue({
        metricName: "complexity",
        metricValue: 3,
    });
    vi.spyOn(Functions.prototype, "calculate").mockReturnValue({
        metricName: "functions",
        metricValue: 4,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 5,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockReturnValue({
        metricName: "max_nesting_level",
        metricValue: 6,
    });
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "real_lines_of_code",
        metricValue: 7,
    });
    vi.spyOn(LinesOfCodeRawText, "calculateLinesOfCodeRawText").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 8,
    });
}

function initiateErrorSpies(): void {
    vi.spyOn(Classes.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating classes metric");
    });
    vi.spyOn(CommentLines.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating commentLines metric");
    });
    vi.spyOn(Complexity.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating complexity metric");
    });
    vi.spyOn(Functions.prototype, "calculate").mockReturnValue({
        metricName: "functions",
        metricValue: 1,
    });
    vi.spyOn(LinesOfCode.prototype, "calculate").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 2,
    });
    vi.spyOn(MaxNestingLevel.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating maxNestingLevel metric");
    });
    vi.spyOn(RealLinesOfCode.prototype, "calculate").mockImplementation(() => {
        throw new Error("something went wrong when calculating realLinesOfCode metric");
    });
    vi.spyOn(LinesOfCodeRawText, "calculateLinesOfCodeRawText").mockReturnValue({
        metricName: "lines_of_code",
        metricValue: 8,
    });
}

describe("MetricCalculator.calculateMetrics()", () => {
    let parser: Parser;

    beforeAll(() => {
        parser = new Parser();
    });

    beforeEach(() => {
        vi.spyOn(fs, "readFile").mockReset();
        mockConsole();
    });

    it("should calculate all metrics of type source code for a python file", async () => {
        // Given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = parsedFile;

        initiateSpies();

        // When
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // Then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code and maximum nesting level for a JSON file", async () => {
        // Given
        parser.setLanguage(languageToGrammar.get(Language.JSON));
        const tree = parser.parse('{ "a": { "b": "c" } }');
        const parsedFile = new ParsedFile("test.json", Language.JSON, tree);
        const parsedFilePromise = parsedFile;

        initiateSpies();

        // When
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // Then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should calculate lines of code for a text file", async () => {
        // Given
        const unsupportedFile = new UnsupportedFile("test.txt");
        const unsupportedFilePromise = unsupportedFile;

        initiateSpies();

        // When
        const [sourceFile, fileMetricResults] = await calculateMetrics(unsupportedFilePromise);

        // Then
        expect(sourceFile).toEqual(unsupportedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });

    it("should return an empty map of metrics when the source file is an error file", async () => {
        // Given
        const errorFile = new ErrorFile(
            "/path/to/error/causing/file.js",
            new Error(
                "Root node of syntax tree for file /path/to/error/causing/file.js is undefined!",
            ),
        );

        const errorFilePromise = errorFile;

        // When
        const result = await calculateMetrics(errorFilePromise);

        // Then
        const expectedResult: [SourceFile, FileMetricResults] = [
            errorFile,
            { fileType: FileType.Error, metricResults: [], metricErrors: [] },
        ];
        expect(result).toEqual(expectedResult);
    });

    it("should include an error object in the result when an error is thrown while calculating any metric on a source file", async () => {
        // Given
        parser.setLanguage(languageToGrammar.get(Language.Python));
        const tree = parser.parse("sum(range(4))");
        const parsedFile = new ParsedFile("test.py", Language.Python, tree);
        const parsedFilePromise = parsedFile;

        initiateErrorSpies();

        // When
        const [sourceFile, fileMetricResults] = await calculateMetrics(parsedFilePromise);

        // Then
        expect(sourceFile).toEqual(parsedFile);
        expect(fileMetricResults).toMatchSnapshot();
    });
});
