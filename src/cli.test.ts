import { afterAll, describe, expect, it, vi } from "vitest";
import * as ImportNodeTypes from "./commands/import-grammars/ImportNodeTypes.js";
import { parser } from "./cli.js";
import { mockConsole } from "../test/metric-end-results/TestHelper.js";
import { Configuration } from "./parser/Configuration.js";
import { CouplingResult, FileMetricResults } from "./parser/metrics/Metric.js";
import fs from "fs/promises";
import * as outputMetrics from "./commands/outputMetrics.js";

const parserConstructor = vi.hoisted(() => vi.fn<[Configuration]>());
const parserCalculateMetrics = vi.hoisted(() =>
    vi.fn<
        [],
        Promise<{
            couplingMetrics: CouplingResult;
            fileMetrics: Map<string, FileMetricResults>;
            unsupportedFiles: string[];
            errorFiles: string[];
        }>
    >(),
);
vi.mock("./parser/GenericParser.js", () => ({
    GenericParser: class GenericParser {
        constructor(config: Configuration) {
            parserConstructor(config);
        }
        calculateMetrics = parserCalculateMetrics;
    },
}));

describe("cli", () => {
    afterAll(() => {
        vi.resetModules();
    });

    itShouldOfferHelp();

    describe("import-grammars command", () => {
        itShouldOfferHelp("import-grammars");

        it("should call updateNodeTypesMappingFile()", async () => {
            vi.spyOn(ImportNodeTypes, "updateNodeTypesMappingFile").mockReset();
            await parser.parse("import-grammars");
            expect(ImportNodeTypes.updateNodeTypesMappingFile).toHaveBeenCalled();
        });
    });

    describe("parse command", () => {
        const expectedConfig = new Configuration({
            sourcesPath: ".",
            outputPath: "metrics.json",
            parseDependencies: false,
            exclusions: "node_modules,.idea,dist,build,out,vendor",
            parseAllHAsC: false,
            parseSomeHAsC: "",
            compress: false,
            relativePaths: false,
        });
        const expectedMetrics = {
            couplingMetrics: { relationships: [], metrics: new Map() },
            fileMetrics: new Map(),
            unsupportedFiles: ["unsupported"],
            errorFiles: ["error"],
        };

        itShouldOfferHelp("parse");

        it("should calculate and output metrics", async () => {
            mockConsole();
            vi.spyOn(fs, "realpath").mockImplementation((path) => Promise.resolve(path.toString()));
            parserCalculateMetrics.mockResolvedValue(expectedMetrics);
            vi.spyOn(outputMetrics, "outputAsJson").mockReset();

            await parser.parse("parse . -o metrics.json");

            expect(console.time).toHaveBeenCalledWith("Time to complete");
            expect(parserConstructor).toHaveBeenCalledWith(expectedConfig);
            expect(parserCalculateMetrics).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith("#####################################");
            expect(console.log).toHaveBeenCalledWith("Metrics calculation finished.");
            expect(console.timeEnd).toHaveBeenCalledWith("Time to complete");
            expect(outputMetrics.outputAsJson).toHaveBeenCalledWith(
                expectedMetrics.fileMetrics,
                expectedMetrics.unsupportedFiles,
                expectedMetrics.errorFiles,
                expectedMetrics.couplingMetrics,
                expectedConfig.outputPath,
                expectedConfig.compress,
            );
        });

        it("should configure the parser with the correct options", async () => {
            mockConsole();
            vi.spyOn(fs, "realpath").mockImplementation((path) => Promise.resolve(path.toString()));
            parserCalculateMetrics.mockResolvedValue(expectedMetrics);
            vi.spyOn(outputMetrics, "outputAsJson").mockReset();

            await parser.parse("parse . -o metrics.json -r");
            expect(parserConstructor).toHaveBeenNthCalledWith(1, {
                ...expectedConfig,
                relativePaths: true,
            });

            await parser.parse("parse . -o metrics.json -e excluded");
            expect(parserConstructor).toHaveBeenNthCalledWith(2, {
                ...expectedConfig,
                exclusions: new Set(["excluded"]),
            });

            await parser.parse("parse . -o metrics.json --hc");
            expect(parserConstructor).toHaveBeenNthCalledWith(3, {
                ...expectedConfig,
                parseAllHAsC: true,
            });

            await parser.parse("parse . -o metrics.json --shc some");
            expect(parserConstructor).toHaveBeenNthCalledWith(4, {
                ...expectedConfig,
                parseSomeHAsC: new Set(["some"]),
            });

            await parser.parse("parse . -o metrics.json -c");
            expect(parserConstructor).toHaveBeenNthCalledWith(5, {
                ...expectedConfig,
                compress: true,
            });

            await parser.parse("parse . -o metrics.json --parse-dependencies");
            expect(parserConstructor).toHaveBeenNthCalledWith(6, {
                ...expectedConfig,
                parseDependencies: true,
            });
        });

        it("should log error if metrics calculation fails", async () => {
            mockConsole();
            const error = new Error("Error");
            parserCalculateMetrics.mockRejectedValue(error);
            vi.spyOn(outputMetrics, "outputAsJson").mockReset();

            await parser.parse("parse . -o metrics.json");

            expect(console.error).toHaveBeenCalledTimes(4);
            expect(console.error).toHaveBeenCalledWith("#####################################");
            expect(console.error).toHaveBeenCalledWith("#####################################");
            expect(console.error).toHaveBeenCalledWith(
                "Metrics calculation failed with the following error:",
            );
            expect(console.error).toHaveBeenCalledWith(error);
            expect(outputMetrics.outputAsJson).not.toHaveBeenCalled();
        });

        it("should log error if output of metrics fails", async () => {
            mockConsole();
            parserCalculateMetrics.mockResolvedValue(expectedMetrics);
            const error = new Error("Error");
            vi.spyOn(outputMetrics, "outputAsJson").mockImplementation(() => {
                throw error;
            });

            await parser.parse("parse . -o metrics.json");

            expect(console.error).toHaveBeenCalledTimes(4);
            expect(console.error).toHaveBeenCalledWith("#####################################");
            expect(console.error).toHaveBeenCalledWith("#####################################");
            expect(console.error).toHaveBeenCalledWith(
                "Metrics calculation failed with the following error:",
            );
            expect(console.error).toHaveBeenCalledWith(error);
        });
    });

    function itShouldOfferHelp(command = ""): void {
        it("should offer help", async () => {
            mockConsole();
            await parser.exitProcess(false).parse(`${command} --help`);
            expect(vi.mocked(console.log).mock.lastCall?.[0]).toMatchSnapshot();
        });
    }
});
