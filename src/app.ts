import { McCabeComplexity } from "./metrics/McCabeComplexity";
import {Functions} from "./metrics/Functions";
import {Classes} from "./metrics/Classes";
import fs from "fs";
import path from "path";
import {getParseFile} from "./helper";
import {grammars} from "./grammars";

const sourcesRoot = process.argv[2] ? fs.realpathSync(process.argv[2]) : fs.realpathSync(".") + "/resources"

console.log("\n\n")
console.log("----- Try to parse " + sourcesRoot + " recursively -----")
console.log("\n\n")

const mcc = new McCabeComplexity();
const functions = new Functions();
const classes = new Classes();

const metrics: Metric[] = [mcc, functions, classes];

const walkSync = (dir, fileList: string[] = [], whiteList: string[] = []) => {
    fs.readdirSync(dir).forEach(file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            fileList = walkSync(path.join(dir, file), fileList, whiteList)
        } else if (whiteList.includes(file.split(".").pop().toLowerCase())) {
            fileList = fileList.concat(path.join(dir, file))
        }
    });
    return fileList;
}

const startTime = performance.now()

const files = walkSync(sourcesRoot, [], [...grammars.keys()]);
console.log(" --- " + files.length + " files detected");
console.log("\n\n")

for (const filePath of files) {
    const parseFile = getParseFile(filePath);
    if (!parseFile || !grammars.has(parseFile.language)) {
        continue
    }

    console.log(" ------------ Parsing File " + path.basename(parseFile.filePath) + "  ------------ ")

    for (const metric of metrics) {
        metric.calculate(parseFile);
    }
}

const endTime = performance.now()
const duration = endTime - startTime
console.log(`Parsing took ${duration / 1000} seconds or ${duration / 1000 / 60} minutes respectively`)

