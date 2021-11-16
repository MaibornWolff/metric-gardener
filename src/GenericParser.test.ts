import { GenericParser } from "./GenericParser";
import fs from "fs";

describe("GenericParser", () => {
    describe("parses PHP McCabeComplexity metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/if-statements.php"
            );

            expect(
                fileMetrics.get(phpTestResourcesPath + "/if-statements.php").get("mcc").metricValue
            ).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/functions-and-methods.php"
            );

            expect(
                fileMetrics.get(phpTestResourcesPath + "/functions-and-methods.php").get("mcc")
                    .metricValue
            ).toBe(6);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/multiple-return-statements.php"
            );

            expect(
                fileMetrics.get(phpTestResourcesPath + "/multiple-return-statements.php").get("mcc")
                    .metricValue
            ).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(phpTestResourcesPath + "/classes.php");

            expect(
                fileMetrics.get(phpTestResourcesPath + "/classes.php").get("mcc").metricValue
            ).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/case-statements.php"
            );

            expect(
                fileMetrics.get(phpTestResourcesPath + "/case-statements.php").get("mcc")
                    .metricValue
            ).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/throw-try-catch-finally.php"
            );

            expect(
                fileMetrics.get(phpTestResourcesPath + "/throw-try-catch-finally.php").get("mcc")
                    .metricValue
            ).toBe(2);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(phpTestResourcesPath + "/loops.php");

            expect(
                fileMetrics.get(phpTestResourcesPath + "/loops.php").get("mcc").metricValue
            ).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count class declarations", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(phpTestResourcesPath + "/classes.php");

            expect(
                fileMetrics.get(phpTestResourcesPath + "/classes.php").get("classes").metricValue
            ).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count function declarations", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                phpTestResourcesPath + "/functions-and-methods.php"
            );

            expect(
                fileMetrics
                    .get(phpTestResourcesPath + "/functions-and-methods.php")
                    .get("functions").metricValue
            ).toBe(6);
        });
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(tsTestResourcesPath + "/if-statements.ts");

            expect(
                fileMetrics.get(tsTestResourcesPath + "/if-statements.ts").get("mcc").metricValue
            ).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                tsTestResourcesPath + "/functions-and-methods.ts"
            );

            expect(
                fileMetrics.get(tsTestResourcesPath + "/functions-and-methods.ts").get("mcc")
                    .metricValue
            ).toBe(9);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                tsTestResourcesPath + "/multiple-return-statements.ts"
            );

            expect(
                fileMetrics.get(tsTestResourcesPath + "/multiple-return-statements.ts").get("mcc")
                    .metricValue
            ).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(tsTestResourcesPath + "/classes.ts");

            expect(
                fileMetrics.get(tsTestResourcesPath + "/classes.ts").get("mcc").metricValue
            ).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                tsTestResourcesPath + "/case-statements.ts"
            );

            expect(
                fileMetrics.get(tsTestResourcesPath + "/case-statements.ts").get("mcc").metricValue
            ).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                tsTestResourcesPath + "/throw-try-catch-finally.ts"
            );

            expect(
                fileMetrics.get(tsTestResourcesPath + "/throw-try-catch-finally.ts").get("mcc")
                    .metricValue
            ).toBe(2);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(tsTestResourcesPath + "/loops.ts");

            expect(fileMetrics.get(tsTestResourcesPath + "/loops.ts").get("mcc").metricValue).toBe(
                3
            );
        });
    });

    describe("parses TypeScript classes metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count class declarations", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(tsTestResourcesPath + "/classes.ts");

            expect(
                fileMetrics.get(tsTestResourcesPath + "/classes.ts").get("classes").metricValue
            ).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count functions and methods properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                tsTestResourcesPath + "/functions-and-methods.ts"
            );

            expect(
                fileMetrics.get(tsTestResourcesPath + "/functions-and-methods.ts").get("functions")
                    .metricValue
            ).toBe(9);
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        const goTestResourcesPath = fs.realpathSync(".") + "/resources/go";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(goTestResourcesPath + "/if-statements.go");

            expect(
                fileMetrics.get(goTestResourcesPath + "/if-statements.go").get("mcc").metricValue
            ).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                goTestResourcesPath + "/functions-and-methods.go"
            );

            expect(
                fileMetrics.get(goTestResourcesPath + "/functions-and-methods.go").get("mcc")
                    .metricValue
            ).toBe(2);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                goTestResourcesPath + "/multiple-return-statements.go"
            );

            expect(
                fileMetrics.get(goTestResourcesPath + "/multiple-return-statements.go").get("mcc")
                    .metricValue
            ).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(goTestResourcesPath + "/classes.go");

            expect(
                fileMetrics.get(goTestResourcesPath + "/classes.go").get("mcc").metricValue
            ).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                goTestResourcesPath + "/case-statements.go"
            );

            expect(
                fileMetrics.get(goTestResourcesPath + "/case-statements.go").get("mcc").metricValue
            ).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                goTestResourcesPath + "/throw-try-catch-finally.go"
            );

            expect(
                fileMetrics.get(goTestResourcesPath + "/throw-try-catch-finally.go").get("mcc")
                    .metricValue
            ).toBe(0);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(goTestResourcesPath + "/loops.go");

            expect(fileMetrics.get(goTestResourcesPath + "/loops.go").get("mcc").metricValue).toBe(
                4
            );
        });
    });

    describe("parses GO functions metric", () => {
        const goTestResourcesPath = fs.realpathSync(".") + "/resources/go";

        it("should count functions and methods properly", () => {
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(
                goTestResourcesPath + "/functions-and-methods.go"
            );

            expect(
                fileMetrics.get(goTestResourcesPath + "/functions-and-methods.go").get("functions")
                    .metricValue
            ).toBe(2);
        });
    });
});
