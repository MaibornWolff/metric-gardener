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

        it("should count functions correctly", () => {
            throw "unsure: AUTOLOAD";
            throw "unsure: BEGIN, UNITCHECK, CHECK, INIT, END";
            throw "unsure: defer";
            testFileMetric(path + "sub.pl", FileMetric.complexity, 8);
            testFileMetric(path + "sub-anonymous.pl", FileMetric.complexity, 6);
            testFileMetric(path + "sub-autoload.pl", FileMetric.complexity, 1);
            testFileMetric(path + "classes.pl", FileMetric.complexity, 4);
            testFileMetric(path + "classes-using-packages.pl", FileMetric.complexity, 4);
            testFileMetric(path + "compound-statements.pl", FileMetric.functions, 0);
            testFileMetric(path + "defer-blocks.pl", FileMetric.functions, 0);
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

    describe("parsing functions metric", () => {
        it("should count subroutines", () => {
            // count: sub definition
            // not: sub declaration
            testFileMetric(path + "sub.pl", FileMetric.functions, 8);
        });

        it("should count anonymous subroutines", () => {
            // count: sub
            testFileMetric(path + "sub-anonymous.pl", FileMetric.functions, 6);
        });

        it("should count AUTOLOAD", () => {
            throw "unsure: AUTOLOAD";
            testFileMetric(path + "sub-autoload.pl", FileMetric.functions, 1);
        });

        it("should count class ADJUST and methods", () => {
            // count: ADJUST, method, sub, sub DESTROY
            testFileMetric(path + "classes.pl", FileMetric.functions, 4);
            testFileMetric(path + "classes-using-packages.pl", FileMetric.functions, 4);
        });

        it("should ??? NOT ??? count compound statements", () => {
            // not: if, else, elsif, unless, given, when, while, until, for, foreach, continue, {}
            throw "unsure: BEGIN, UNITCHECK, CHECK, INIT, END";
            testFileMetric(path + "compound-statements.pl", FileMetric.functions, 0);
        });

        it("should ??? NOT ??? count defer blocks", () => {
            throw "unsure: defer";
            testFileMetric(path + "defer-blocks.pl", FileMetric.functions, 0);
        });
    });

    describe("parsing classes metric", () => {
        it("should count classes correctly", () => {
            // count: class definition
            // not: class declaration
            testFileMetric(path + "classes.pl", FileMetric.classes, 2);
        });

        it("should count classes using packages correctly", () => {
            throw "unsure: package, bless, parent";
            testFileMetric(path + "classes-using-packages.pl", FileMetric.classes, 2);
        });

        it("should NOT count normal packages", () => {
            testFileMetric(path + "modules/Module.pm", FileMetric.classes, 0);
        });
    });

    describe("parsing lines_of_code metric", () => {
        it("should count comments correctly", () => {
            testFileMetric(path + "comments.pl", FileMetric.linesOfCode, 9);
        });

        it("should count empty files correctly", () => {
            testFileMetric(path + "empty.pl", FileMetric.linesOfCode, 1);
        });

        it("should count one line break correctly", () => {
            testFileMetric(path + "line-break.pl", FileMetric.linesOfCode, 2);
        });

        it("should count one line correctly", () => {
            testFileMetric(path + "line-break.pl", FileMetric.linesOfCode, 1);
        });

        it("should count pods correctly", () => {
            testFileMetric(path + "pod.pl", FileMetric.linesOfCode, 27);
        });

        it("should count __DATA__ correctly", () => {
            testFileMetric(path + "special-literals-data.pl", FileMetric.linesOfCode, 12);
        });

        it("should count __END__ correctly", () => {
            testFileMetric(path + "special-literals.pl", FileMetric.linesOfCode, 20);
        });

        it("should count weird lines correctly", () => {
            testFileMetric(path + "weird-lines.pl", FileMetric.linesOfCode, 15);
        });
    });

    describe("parsing comment_lines metric", () => {
        describe("parsing comment_lines metric", () => {
            it("should count comments correctly", () => {
                // count: lines starting with #, lines having only spaces and tabs before #
                throw "unsure: lines having code before #";
                testFileMetric(path + "comments.pl", FileMetric.commentLines, 4);
            });

            it("should count pods", () => {
                testFileMetric(path + "pod.pl", FileMetric.commentLines, 14);
            });

            it("should ??? NOT ??? count __DATA__", () => {
                throw "unsure: __DATA__";
                testFileMetric(path + "special-literals-data.pl", FileMetric.commentLines, 2);
            });

            it("should count __END__", () => {
                throw "unsure: line with __END__";
                testFileMetric(path + "special-literals.pl", FileMetric.commentLines, 5);
            });
        });
    });

    // describe("parsing real_lines_of_code metric", () => {});

    // describe("parsing max_nesting_level metric", () => {}); ???

    // describe("parsing coupling metric", () => {}); ???
});
