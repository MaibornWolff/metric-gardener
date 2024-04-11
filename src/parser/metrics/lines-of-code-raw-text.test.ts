import { describe, expect, it } from "vitest";
import { calculateLinesOfCodeRawText } from "./lines-of-code-raw-text.js";

describe("LinesOfCodeRawText.calculate(...)", () => {
    it("should calculate lines of code correctly for a file with multiple lines", () => {
        const sourceCode = `Line one is the best line.
or may it is line two?
I don't know what the best line is, but line three is great, too!

Line five is rather lonely, what can be done here?
May add line six as friend, it would be quite near.`;

        expectLinesOfCode(sourceCode, 6);
    });

    it("should count correctly for a file with line feed as line separator", () => {
        const sourceCode = "First line\u{000A}Second line\u{000A}Third line";
        expectLinesOfCode(sourceCode, 3);
    });

    it("should count correctly for a file with line feed as line separator and empty lines", () => {
        const sourceCode = "First line\u{000A}\u{000A}Third line\u{000A}Fourth line\u{000A}";
        expectLinesOfCode(sourceCode, 5);
    });

    it("should count correctly for a file with carriage return line feed as line separator", () => {
        const sourceCode = "First line\u{000D}\u{000A}Second line\u{000D}\u{000A}Third line";
        expectLinesOfCode(sourceCode, 3);
    });

    it("should count correctly for a file with carriage return line feed as line separator and empty lines", () => {
        const sourceCode =
            "First line\u{000D}\u{000A}\u{000D}\u{000A}Third line\u{000D}\u{000A}Fourth line\u{000D}\u{000A}";
        expectLinesOfCode(sourceCode, 5);
    });

    it("should count correctly for a file with carriage return as line separator", () => {
        const sourceCode = "First line\u{000D}Second line\u{000D}Third line";
        expectLinesOfCode(sourceCode, 3);
    });

    it("should count correctly for a file with carriage return as line separator and empty lines", () => {
        const sourceCode = "First line\u{000D}\u{000D}Third line\u{000D}Fourth line\u{000D}";
        expectLinesOfCode(sourceCode, 5);
    });

    it("should calculate lines of code correctly for an empty file", () => {
        expectLinesOfCode("", 1);
    });

    it("should calculate lines of code correctly for an one-line file", () => {
        expectLinesOfCode("one-line", 1);
    });

    function expectLinesOfCode(sourceCode: string, expectedLines: number): void {
        expect(calculateLinesOfCodeRawText(sourceCode)).toEqual({
            metricName: "lines_of_code",
            metricValue: expectedLines,
        });
    }
});
