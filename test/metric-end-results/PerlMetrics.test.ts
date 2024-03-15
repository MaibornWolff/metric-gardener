import { expectFileMetric, parseAllFileMetrics } from "./TestHelper";
import { FileMetric, FileMetricResults } from "../../src/parser/metrics/Metric";

describe("Perl metrics tests", () => {
    const path = "./resources/perl/";

    let results: Map<string, FileMetricResults>;

    const testFileMetric = (inputPath: string, metric: FileMetric, expected: number) =>
        expectFileMetric(results, inputPath, metric, expected);

    beforeAll(async () => {
        results = await parseAllFileMetrics(path);
    });

    describe("parsing complexity metric", () => {
        it("should count compound statements correctly", () => {
            // count: if, elsif, unless, when, while, until, for, foreach
            // not: else, given, continue, {}
            throw "unsure: BEGIN, UNITCHECK, CHECK, INIT, END";
            testFileMetric(path + "compound-statements.pl", FileMetric.complexity, 23);
        });

        it("should ??? NOT ??? count defer blocks", () => {
            throw "unsure: defer";
            testFileMetric(path + "defer-blocks.pl", FileMetric.complexity, 0);
        });

        it("should ??? NOT ??? count dump", () => {
            throw "unsure: dump, CORE::dump";
            testFileMetric(path + "dump.pl", FileMetric.complexity, 0);
        });

        it("should ??? NOT ??? count exit", () => {
            throw "unsure: exit";
            testFileMetric(path + "exit.pl", FileMetric.complexity, 0);
        });

        it("should ??? NOT ??? count goto", () => {
            throw "unsure: goto LABEL, goto EXPR, goto &NAME";
            testFileMetric(path + "goto.pl", FileMetric.complexity, 0);
        });

        it("should ??? NOT ??? count loop control commands", () => {
            // (count: while, if)
            throw "unsure: next, last, redo";
            testFileMetric(path + "loop-control.pl", FileMetric.complexity, 5);
        });

        it("should count operators correctly", () => {
            // count: and, &&, or, ||, //, ?:
            // not: everything else
            throw "unsure: xor, &&=, ||=, //=";
            testFileMetric(path + "operators.pl", FileMetric.complexity, 19);
        });

        it("should count statement modifiers correctly", () => {
            // count: if, unless, while, until, for, foreach, when
            // not: given
            testFileMetric(path + "statement-modifiers.pl", FileMetric.complexity, 7);
        });

        it("should count subroutines", () => {
            // count: sub definition, anonymous
            // not: sub declaration
            throw "unsure: AUTOLOAD";
            testFileMetric(path + "sub.pl", FileMetric.complexity, 8);
            testFileMetric(path + "sub-anonymous.pl", FileMetric.complexity, 6);
            testFileMetric(path + "sub-autoload.pl", FileMetric.complexity, 1);
        });

        it("should count switch statements correctly", () => {
            // count: when
            // not: default
            throw "unsure: for, foreach, given, continue, break";
            testFileMetric(path + "switch-statements.pl", FileMetric.complexity, 10);
        });

        it("should count try-catch correctly", () => {
            throw "unsure: eval, die, do, try, catch";
            testFileMetric(path + "try-catch.pl", FileMetric.complexity, 0);
        });
    });

    // describe("parsing functions metric", () => {});

    // describe("parsing classes metric", () => {});

    // describe("parsing lines_of_code metric", () => {});

    // describe("parsing comment_lines metric", () => {});

    // describe("parsing real_lines_of_code metric", () => {});

    // describe("parsing max_nesting_level metric", () => {}); ???

    // describe("parsing coupling metric", () => {}); ???
});
