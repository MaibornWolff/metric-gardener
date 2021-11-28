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
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { Coupling } from "./metrics/Coupling";
import neo4j from "neo4j-driver";
import { NamespaceCollector } from "./collectors/NamespaceCollector";
import { UsagesCollector } from "./collectors/UsagesCollector";
import { NamespaceReference } from "./collectors/namespaces/AbstractCollector";

export class GenericParser {
    private readonly fileMetrics: Metric[] = [];
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private namespaceCollector: NamespaceCollector;
    private usageCollector: UsagesCollector;

    private edgeMetrics: CouplingMetricResult;

    constructor(configuration: Configuration) {
        this.config = configuration;

        const nodeTypesJson = fs
            .readFileSync(fs.realpathSync("./resources/node-types-mapped.config"))
            .toString();
        const allNodeTypes: ExpressionMetricMapping[] = JSON.parse(nodeTypesJson);

        this.fileMetrics = [
            new McCabeComplexity(allNodeTypes),
            new Functions(allNodeTypes),
            new Classes(allNodeTypes),
            new LinesOfCode(allNodeTypes),
            new CommentLines(allNodeTypes),
            new RealLinesOfCode(allNodeTypes),
        ];

        this.namespaceCollector = new NamespaceCollector();
        this.usageCollector = new UsagesCollector();

        this.comprisingMetrics = [
            new Coupling(allNodeTypes, this.namespaceCollector, this.usageCollector),
        ];
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
            console.log("\n\nPARSING COUPLING");
            this.edgeMetrics = metric.calculate(parseFiles);
        }

        if (this.edgeMetrics.metricValue.length > 0) {
            this.buildDependencyGraph(this.edgeMetrics).then(() => {
                console.log("Dependency Graph done");
            });
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

    private async buildDependencyGraph(couplingData: CouplingMetricResult) {
        // create dependency graph in neo4j
        // write nodes and edges to neo4j

        const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "admin"));
        const session = driver.session();

        try {
            await session.writeTransaction((tx) => tx.run("MATCH (n) DETACH DELETE n"));

            for (const [
                language,
                namespaceReferences,
            ] of this.namespaceCollector.getAllNamespaces()) {
                for (const namespaceReferenceItem of namespaceReferences.values()) {
                    const namespaceReference: NamespaceReference = namespaceReferenceItem
                        .values()
                        .next().value;
                    const { namespace, source, className, classType } = namespaceReference;

                    await session.writeTransaction((tx) =>
                        tx.run(
                            `
                                CREATE (n:` +
                                classType.toUpperCase() +
                                `)
                                SET
                                    n.namespace = $namespace,
                                    n.sourcePath = $source,
                                    n.className = $className,
                                    n.language = $language
                            `,
                            { namespace, source, className, language }
                        )
                    );
                }
            }

            for (const relationship of couplingData.metricValue) {
                const { fromSource, toSource, usageType } = relationship;

                await session.writeTransaction((tx) =>
                    tx.run(
                        `
                            MATCH
                                (a),
                                (b)
                            WHERE a.sourcePath = $fromSource AND b.sourcePath = $toSource
                            CREATE (a)-[r:` +
                            usageType.toUpperCase() +
                            `]->(b)
                        `,
                        { fromSource, toSource, usageType }
                    )
                );
            }
        } finally {
            await session.close();
        }

        // on application exit:
        await driver.close();
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
