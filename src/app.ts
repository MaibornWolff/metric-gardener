import {GenericParser} from "./GenericParser";

const sourcesRoot = process.argv[2] ?? "." + "/resources";

const parser = new GenericParser();
parser.calculateMetrics(sourcesRoot)
