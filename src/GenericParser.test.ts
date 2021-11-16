import { GenericParser } from "./GenericParser";
import fs from "fs";

describe("GenericParser", () => {
    const phpTestResourcesPath = "./resources/php/";
    const tsTestResourcesPath = "./resources/typescript/";
    const goTestResourcesPath = "./resources/go/";

    describe("parses PHP McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "if-statements.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(6);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const inputPath = fs.realpathSync(
                phpTestResourcesPath + "multiple-return-statements.php"
            );
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "case-statements.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "throw-try-catch-finally.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "loops.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(4);
        });
    });

    describe("parses PHP classes metric", () => {
        it("should count class declarations", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "classes.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("classes").metricValue).toBe(3);
        });
    });

    describe("parses PHP functions metric", () => {
        it("should count function declarations", () => {
            const inputPath = fs.realpathSync(phpTestResourcesPath + "functions-and-methods.php");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("functions").metricValue).toBe(6);
        });
    });

    describe("parses TypeScript McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "if-statements.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(8);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(8);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const inputPath = fs.realpathSync(
                tsTestResourcesPath + "multiple-return-statements.ts"
            );
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "case-statements.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "throw-try-catch-finally.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(2);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "loops.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(3);
        });
    });

    describe("parses TypeScript classes metric", () => {
        it("should count class declarations", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "classes.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("classes").metricValue).toBe(3);
        });
    });

    describe("parses TypeScript functions metric", () => {
        it("should count functions and methods properly", () => {
            const inputPath = fs.realpathSync(tsTestResourcesPath + "functions-and-methods.ts");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("functions").metricValue).toBe(9);
        });
    });

    describe("parses GO McCabeComplexity metric", () => {
        it("should count if statements correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "if-statements.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(7);
        });

        it("should count functions and methods correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(2);
        });

        it("should count multiple return statements within functions and methods correctly", () => {
            const inputPath = fs.realpathSync(
                goTestResourcesPath + "multiple-return-statements.go"
            );
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(4);
        });

        it("should not count any class declaration", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "classes.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(0);
        });

        it("should count case statements correctly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "case-statements.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(3);
        });

        it("should count try-catch-finally properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "throw-try-catch-finally.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(0);
        });

        it("should count loops properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "loops.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("mcc").metricValue).toBe(4);
        });
    });

    describe("parses GO functions metric", () => {
        it("should count functions and methods properly", () => {
            const inputPath = fs.realpathSync(goTestResourcesPath + "functions-and-methods.go");
            const parser = new GenericParser();
            const fileMetrics = parser.calculateMetrics(inputPath);

            expect(fileMetrics.get(inputPath).get("functions").metricValue).toBe(2);
        });
    });
});
