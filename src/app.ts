#!/usr/bin/env node
import { GenericParser } from "./parser/GenericParser";
import { Configuration } from "./parser/Configuration";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { updateNodeTypesMappingFile } from "./commands/import-grammars/ImportNodeTypes";
import { outputAsJson } from "./commands/outputMetrics";
import fs from "fs";

yargs(hideBin(process.argv))
    .command(
        "import-grammars",
        "(re-)import grammar expression types for supported languages",
        {},
        (_argv) => {
            updateNodeTypesMappingFile();
        },
    )
    .command(
        "parse [sources-path]",
        "parse file or folders recursively by given path and calculate metrics",
        (cmdYargs) => {
            return cmdYargs
                .positional("sources-path", {
                    describe: "path to sources",
                })
                .option("output-path", {
                    alias: "o",
                    type: "string",
                    description: "Output file path (required)",
                })
                .option("relative-paths", {
                    alias: "r",
                    type: "boolean",
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
        (argv) => {
            parseSourceCode(argv);
        },
    )
    .demandCommand()
    .strictCommands()
    .strictOptions()
    .parseSync();

async function parseSourceCode(argv) {
    const configuration = new Configuration({
        sourcesPath: await fs.promises.realpath(argv["sources-path"]),
        outputPath: argv["output-path"],
        parseDependencies: argv["parse-dependencies"],
        exclusions: argv["exclusions"],
        parseAllHAsC: argv["parse-h-as-c"],
        parseSomeHAsC: argv["parse-some-h-as-c"],
        compress: argv["compress"],
        relativePaths: argv["relative-paths"],
    });

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
}
