import { McCabeComplexity } from "./metrics/McCabeComplexity";
import { Functions } from "./metrics/Functions";
import { Classes } from "./metrics/Classes";
import { grammars } from "./grammars";
import { getParseFile } from "./helper";
import path from "path";
import fs from "fs";
import {ExpressionMetricMapping} from "./app";
import {LinesOfCode} from "./metrics/LinesOfCode";
import {CommentLines} from "./metrics/CommentLines";
import {RealLinesOfCode} from "./metrics/RealLinesOfCode";
import {Coupling} from "./metrics/Coupling";
import {CouplingCSharp} from "./metrics/CouplingCSharp";

export class GenericParser {
    private readonly fileMetrics: Metric[] = [];
    private readonly comprisingMetrics: CouplingMetric[] = [];

    private edgeMetrics: CouplingMetricResult;

    constructor() {
        const nodeTypesJson = fs.readFileSync(fs.realpathSync("./resources/node-types-mapped.config")).toString();
        const allNodeTypes: ExpressionMetricMapping[] = JSON.parse(nodeTypesJson);

        this.fileMetrics = [
            new McCabeComplexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(allNodeTypes),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
        ];

        this.comprisingMetrics = [
            new CouplingCSharp(allNodeTypes)
        ];
    }

    getEdgeMetrics(): CouplingMetricResult {
        return this.edgeMetrics
    }

    calculateMetrics(sourcesRoot: string) {
        sourcesRoot = fs.realpathSync(sourcesRoot);

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
            fileMetrics.set(parseFile.filePath, metricResults)

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

        return fileMetrics;
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
