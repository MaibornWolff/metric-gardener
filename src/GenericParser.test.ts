import { GenericParser } from "./GenericParser";
import fs from "fs";

describe("GenericParser", () => {
    describe("parses PHP McCabeComplexity metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/if-statements.php"
            );

            expect(metricResults.get("mcc").metricValue).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/functions-and-methods.php"
            );

            expect(metricResults.get("mcc").metricValue).toBe(6);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/multiple-return-statements.php"
            );

            expect(metricResults.get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(phpTestResourcesPath + "/classes.php");

            expect(metricResults.get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/case-statements.php"
            );

            expect(metricResults.get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/throw-try-catch-finally.php"
            );

            expect(metricResults.get("mcc").metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(phpTestResourcesPath + "/loops.php");

            expect(metricResults.get("mcc").metricValue).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count class declarations", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(phpTestResourcesPath + "/classes.php");

            expect(metricResults.get("classes").metricValue).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        const phpTestResourcesPath = fs.realpathSync(".") + "/resources/php";

        it("should count function declarations", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                phpTestResourcesPath + "/functions-and-methods.php"
            );

            expect(metricResults.get("functions").metricValue).toBe(6);
        });
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/if-statements.ts"
            );

            expect(metricResults.get("mcc").metricValue).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/functions-and-methods.ts"
            );

            expect(metricResults.get("mcc").metricValue).toBe(9);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/multiple-return-statements.ts"
            );

            expect(metricResults.get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(tsTestResourcesPath + "/classes.ts");

            expect(metricResults.get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/case-statements.ts"
            );

            expect(metricResults.get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/throw-try-catch-finally.ts"
            );

            expect(metricResults.get("mcc").metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(tsTestResourcesPath + "/loops.ts");

            expect(metricResults.get("mcc").metricValue).toBe(3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count class declarations", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(tsTestResourcesPath + "/classes.ts");

            expect(metricResults.get("classes").metricValue).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        const tsTestResourcesPath = fs.realpathSync(".") + "/resources/typescript";

        it("should count functions and methods properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                tsTestResourcesPath + "/functions-and-methods.ts"
            );

            expect(metricResults.get("functions").metricValue).toBe(9);
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        const goTestResourcesPath = fs.realpathSync(".") + "/resources/go";

        it("should count if statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/if-statements.go"
            );

            expect(metricResults.get("mcc").metricValue).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/functions-and-methods.go"
            );

            expect(metricResults.get("mcc").metricValue).toBe(2);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/multiple-return-statements.go"
            );

            expect(metricResults.get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(goTestResourcesPath + "/classes.go");

            expect(metricResults.get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/case-statements.go"
            );

            expect(metricResults.get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/throw-try-catch-finally.go"
            );

            expect(metricResults.get("mcc").metricValue).toBe(0);
        });

        it("should count loops properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(goTestResourcesPath + "/loops.go");

            expect(metricResults.get("mcc").metricValue).toBe(4);
        });
    });

    describe("parses GO functions metric", () => {
        const goTestResourcesPath = fs.realpathSync(".") + "/resources/go";

        it("should count functions and methods properly", () => {
            const parser = new GenericParser();
            const metricResults = parser.calculateMetrics(
                goTestResourcesPath + "/functions-and-methods.go"
            );

            expect(metricResults.get("functions").metricValue).toBe(2);
        });
    });
});
