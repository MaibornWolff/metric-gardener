import {McCabeComplexity} from "./metrics/McCabeComplexity";
import {Functions} from "./metrics/Functions";
import {Classes} from "./metrics/Classes";
import {grammars} from "./grammars";
import {getParseFile} from "./helper";
import path from "path";
import fs from "fs";

export class GenericParser {

    private readonly metrics: Metric[] = []

    constructor() {
        this.metrics = [new McCabeComplexity(), new Functions(), new Classes()];
    }

    calculateMetrics(sourcesRoot: string) {
        sourcesRoot = fs.realpathSync(sourcesRoot)

        console.log("\n\n");
        console.log("----- Try to parse " + sourcesRoot + " recursively -----");
        console.log("\n\n");

        const startTime = performance.now();

        const files = this.findFilesRecursively(
            sourcesRoot,
            [...grammars.keys()],
            ["node_modules", ".idea", "dist", "build", "out", "vendor"],
            []
        );

        console.log(" --- " + files.length + " files detected");
        console.log("\n\n");

        const metricResults = new Map<string, MetricResult>();

        for (const filePath of files) {
            const parseFile = getParseFile(filePath);
            if (!parseFile || !grammars.has(parseFile.language)) {
                continue;
            }

            console.log(
                " ------------ Parsing File " + path.basename(parseFile.filePath) + "  ------------ "
            );

            for (const metric of this.metrics) {
                const metricResult = metric.calculate(parseFile);
                metricResults.set(metricResult.metricName, metricResult);
            }
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log("\n\n");
        console.log(
            `Parsing took ${duration / 1000} seconds or ${duration / 1000 / 60} minutes respectively`
        );

        return metricResults;
    }

    private findFilesRecursively(
        dir,
        supportedFileExtensions: string[] = [],
        excludedFolders: string[] = [],
        fileList: string[] = []
    ) {
        if (fs.lstatSync(dir).isFile()) {
            return [dir];
        }

        fs.readdirSync(dir).forEach((file) => {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                const isPathExcluded = excludedFolders.some((folder) => {
                    return dir.includes(folder);
                });
                if (isPathExcluded) {
                    return;
                }

                fileList = this.findFilesRecursively(path.join(dir, file), supportedFileExtensions, excludedFolders, fileList);
            } else if (supportedFileExtensions.includes(file.split(".").pop().toLowerCase())) {
                fileList = fileList.concat(path.join(dir, file));
            }
        });
        return fileList;
    };
}
