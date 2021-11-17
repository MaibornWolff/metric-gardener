import { McCabeComplexity } from "./metrics/McCabeComplexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import { grammars } from "./helper/Grammars";
import { getParseFile } from "./helper/Helper";
import path from "path";
import fs from "fs";
import { LinesOfCode } from "./metrics/LinesOfCode";
import { CommentLines } from "./metrics/CommentLines";
import { RealLinesOfCode } from "./metrics/RealLinesOfCode";
import { CouplingCSharp } from "./metrics/CouplingCSharp";
import { TreeParser } from "./helper/TreeParser";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";

export class GenericParser {
    private readonly fileMetrics: Metric[] = [];
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private edgeMetrics: CouplingMetricResult;

    constructor(configuration: Configuration) {
        this.config = configuration;

        const nodeTypesJson = fs
            .readFileSync(fs.realpathSync("./resources/node-types-mapped.config"))
            .toString();
        const allNodeTypes: ExpressionMetricMapping[] = JSON.parse(nodeTypesJson);

        const treeParser = new TreeParser();

        this.fileMetrics = [
            new McCabeComplexity(allNodeTypes, treeParser),
            new Functions(allNodeTypes, treeParser),
            new Classes(allNodeTypes, treeParser),
            new LinesOfCode(allNodeTypes, treeParser),
            new CommentLines(allNodeTypes, treeParser),
            new RealLinesOfCode(allNodeTypes, treeParser),
        ];

        this.comprisingMetrics = [new CouplingCSharp(allNodeTypes, treeParser)];
        this.comprisingMetrics = [];
    }

    getEdgeMetrics(): CouplingMetricResult {
        return this.edgeMetrics;
    }

    calculateMetrics() {
        const sourcesRoot = fs.realpathSync(this.config.sourcesPath);

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

        const fileMetrics = new Map<string, Map<string, MetricResult>>();

        const parseFiles = [];
        for (const filePath of files) {
            const parseFile = getParseFile(filePath);
            if (!parseFile || !grammars.has(parseFile.language)) {
                continue;
            }

            parseFiles.push(parseFile);
        }

        for (const parseFile of parseFiles) {
            const metricResults = new Map<string, MetricResult>();
            fileMetrics.set(parseFile.filePath, metricResults);

            console.log(
                " ------------ Parsing File " +
                    path.basename(parseFile.filePath) +
                    "  ------------ "
            );

            for (const metric of this.fileMetrics) {
                const metricResult = metric.calculate(parseFile);
                metricResults.set(metricResult.metricName, metricResult);
            }
        }

        for (const metric of this.comprisingMetrics) {
            this.edgeMetrics = metric.calculate(parseFiles);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log("\n\n");
        console.log(
            `Parsing took ${duration / 1000} seconds or ${
                duration / 1000 / 60
            } minutes respectively`
        );

        console.log("\n\n");
        console.log("#####################################");
        console.log("#####################################");
        console.log(fileMetrics);

        return fileMetrics;
    }

    private findFilesRecursively(
        dir: string,
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

                fileList = this.findFilesRecursively(
                    path.join(dir, file),
                    supportedFileExtensions,
                    excludedFolders,
                    fileList
                );
            } else if (supportedFileExtensions.includes(file.split(".").pop().toLowerCase())) {
                fileList = fileList.concat(path.join(dir, file));
            }
        });
        return fileList;
    }
}
