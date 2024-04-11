import fs from "node:fs/promises";
import yargs from "yargs";
import { GenericParser } from "./parser/GenericParser.js";
import { Configuration } from "./parser/Configuration.js";
import { updateNodeTypesMappingFile } from "./commands/import-grammars/ImportNodeTypes.js";
import { outputAsJson } from "./commands/outputMetrics.js";

export const parser = yargs()
    .command(
        "import-grammars",
        "(re-)import grammar expression types for supported languages",
        {},
        async () => {
            await updateNodeTypesMappingFile();
        },
    )
    .command(
        "parse [sources-path]",
        "parse file or folders recursively by given path and calculate metrics",
        (cmdYargs) => {
            return cmdYargs
                .positional("sources-path", {
                    describe: "path to sources",
                    type: "string",
                })
                .option("output-path", {
                    alias: "o",
                    type: "string",
                    description: "Output file path (required)",
                })
                .option("relative-paths", {
                    alias: "r",
                    type: "boolean",
                    default: false,
                    description:
                        "Write relative instead of absolute paths to the analyzed files in the output",
                })
                .option("exclusions", {
                    alias: "e",
                    type: "string",
                    description: "Exclude folders from scanning for files (comma separated list)",
                    default: "node_modules,.idea,dist,build,out,vendor",
                })
                .option("parse-h-as-c", {
                    alias: "hc",
                    type: "boolean",
                    description: "Parse all .h files as C instead of C++ (defaults to C++)",
                    default: false,
                })
                .option("parse-some-h-as-c", {
                    alias: "shc",
                    type: "string",
                    description:
                        "For the specified folders/files (comma separated list), parse .h files as C instead of C++. " +
                        "Ignored if parse-h-as-c is set.",
                    default: "",
                })
                .option("compress", {
                    alias: "c",
                    type: "boolean",
                    description: "output .gz-zipped file",
                    default: false,
                })
                .option("parse-dependencies", {
                    type: "boolean",
                    default: false,
                    description:
                        "EXPERIMENTAL: flag to enable dependency parsing (dependencies will be appended to the output file)",
                })
                .demandOption(["sources-path", "output-path"]);
        },
        async (argv) => {
            const configuration = new Configuration({
                /* eslint-disable @typescript-eslint/dot-notation */
                sourcesPath: await fs.realpath(argv["sources-path"]),
                outputPath: argv["output-path"],
                parseDependencies: argv["parse-dependencies"],
                exclusions: argv["exclusions"],
                parseAllHAsC: argv["parse-h-as-c"],
                parseSomeHAsC: argv["parse-some-h-as-c"],
                compress: argv["compress"],
                relativePaths: argv["relative-paths"],
                /* eslint-enable @typescript-eslint/dot-notation */
            });
            await parseSourceCode(configuration);
        },
    )
    .demandCommand()
    .strictCommands()
    .strictOptions();

async function parseSourceCode(configuration: Configuration): Promise<void> {
    try {
        console.time("Time to complete");

        const parser = new GenericParser(configuration);
        const results = await parser.calculateMetrics();

        console.log("#####################################");
        console.log("Metrics calculation finished.");
        console.timeEnd("Time to complete");

        outputAsJson(
            results.fileMetrics,
            results.unsupportedFiles,
            results.errorFiles,
            results.couplingMetrics,
            configuration.outputPath,
            configuration.compress,
        );
    } catch (error) {
        console.error("#####################################");
        console.error("#####################################");
        console.error("Metrics calculation failed with the following error:");
        console.error(error);
    }
}
