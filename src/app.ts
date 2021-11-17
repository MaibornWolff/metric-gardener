import { GenericParser } from "./parser/GenericParser";
import { Configuration } from "./parser/Configuration";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateNodeTypesMappingFile } from "./commands/treeSitterMapping";
import { outputAsJson } from "./commands/outputMetrics";

const argv = yargs(hideBin(process.argv))
    .command("parse [sources-path]", "parse file or folders recursively by given path", (yargs) => {
        return yargs.positional("sources-path", {
            describe: "path to sources",
            default: "./resources",
        });
    })
    .option("output-path", {
        alias: "o",
        type: "string",
        description: "Output file path",
    })
    .option("exclusions", {
        alias: "e",
        type: "string",
        description: "Excluded folders",
        default: ["node_modules", ".idea", "dist", "build", "out", "vendor"],
    })
    .option("compress", {
        alias: "c",
        type: "boolean",
        description: "output .gz-zipped file",
        default: false,
    })
    .demandOption(["sources-path", "output-path"])
    .strictCommands()
    .strictOptions()
    .parseSync();

generateNodeTypesMappingFile();

const configuration = new Configuration(
    argv["sources-path"],
    argv["output-path"],
    argv["exclusions"],
    argv["compress"]
);
console.log(configuration);

const parser = new GenericParser(configuration);
const fileMetrics = parser.calculateMetrics();

outputAsJson(fileMetrics, parser.getEdgeMetrics());
