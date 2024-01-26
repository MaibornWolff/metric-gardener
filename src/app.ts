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
        (argv) => {
            updateNodeTypesMappingFile();
        }
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
                    description: "Output file path",
                })
                .option("parse-dependencies", {
                    type: "boolean",
                    default: false,
                    description:
                        "Flag to enable dependency parsing (dependencies will be appended to the output file)",
                })
                .option("exclusions", {
                    alias: "e",
                    type: "string",
                    description: "Exclude folders from scanning for files (comma separated list)",
                    default: "node_modules,.idea,dist,build,out,vendor",
                })
                .option("compress", {
                    alias: "c",
                    type: "boolean",
                    description: "output .gz-zipped file",
                    default: false,
                })
                .option("print-relative-paths", {
                    alias: "r",
                    type: "boolean",
                    description:
                        "Use relative instead of absolute paths to the analyzed files in the output",
                })
                .demandOption(["sources-path", "output-path"]);
        },
        (argv) => {
            parseSourceCode(argv);
        }
    )
    .demandCommand()
    .strictCommands()
    .strictOptions()
    .parseSync();

async function parseSourceCode(argv) {
    const configuration = new Configuration(
        await fs.promises.realpath(argv["sources-path"]),
        argv["output-path"],
        argv["parse-dependencies"],
        argv["exclusions"],
        argv["compress"],
        argv["print-relative-paths"]
    );

    const parser = new GenericParser(configuration);
    const results = await parser.calculateMetrics();

    outputAsJson(
        results.fileMetrics,
        results.unknownFiles,
        results.couplingMetrics,
        configuration.outputPath,
        configuration.compress
    );
}
