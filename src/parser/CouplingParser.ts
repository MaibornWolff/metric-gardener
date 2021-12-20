import fs from "fs";
import { ExpressionMetricMapping } from "./helper/Model";
import { Configuration } from "./Configuration";
import { Coupling } from "./metrics/coupling/Coupling";
import neo4j from "neo4j-driver";
import { NamespaceCollector } from "./collectors/NamespaceCollector";
import { UsagesCollector } from "./collectors/UsagesCollector";
import { CouplingMetric, CouplingMetricValue, ParseFile } from "./metrics/Metric";

export class CouplingParser {
    private readonly comprisingMetrics: CouplingMetric[] = [];
    private config: Configuration;

    private readonly namespaceCollector: NamespaceCollector;
    private readonly usageCollector: UsagesCollector;

    constructor(configuration: Configuration) {
        this.config = configuration;

        const nodeTypesJson = fs
            .readFileSync(fs.realpathSync("./resources/node-types-mapped.config"))
            .toString();
        const allNodeTypes: ExpressionMetricMapping[] = JSON.parse(nodeTypesJson);

        this.namespaceCollector = new NamespaceCollector();
        this.usageCollector = new UsagesCollector();

        this.comprisingMetrics = [
            new Coupling(allNodeTypes, this.namespaceCollector, this.usageCollector),
        ];
    }

    calculateMetrics(parseFiles: ParseFile[]) {
        const sourcesRoot = fs.realpathSync(this.config.sourcesPath);

        console.log("\n\n");
        console.log("----- Parsing Coupling of files in " + sourcesRoot + " recursively -----");
        console.log("\n\n");

        console.log(" --- " + parseFiles.length + " files detected", "\n\n");

        // TODO rewrite this to support multiple coupling metrics
        const couplingMetrics = this.comprisingMetrics[0].calculate(parseFiles);

        if (this.config.persistDependencyGraph) {
            this.buildDependencyGraph(couplingMetrics.relationships).then(() => {
                console.log(
                    "Dependency Graph done: Visit http://localhost:7474 with login admin/admin"
                );
            });
        }

        return couplingMetrics;
    }

    private async buildDependencyGraph(relationships: CouplingMetricValue[]) {
        // create dependency graph in neo4j
        // write nodes and edges to neo4j
        if (!this.config.persistDependencyGraph) {
            return;
        }

        const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "admin"));
        const session = driver.session();

        try {
            await session.writeTransaction((tx) => tx.run("MATCH (n) DETACH DELETE n"));

            for (const [
                language,
                namespaceReferences,
            ] of this.namespaceCollector.getAllNamespaces()) {
                for (const namespaceReferencesPerFile of namespaceReferences.values()) {
                    for (const namespaceReference of namespaceReferencesPerFile.values()) {
                        const { namespace, source, className, classType, namespaceDelimiter } =
                            namespaceReference;

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
                                        n.language = $language,
                                        n.fullyQualifiedName = $fullyQualifiedName
                                `,
                                {
                                    namespace,
                                    source,
                                    className,
                                    language,
                                    fullyQualifiedName: namespace + namespaceDelimiter + className,
                                }
                            )
                        );
                    }
                }
            }

            for (const relationship of relationships) {
                const { fromNamespace, toNamespace, usageType } = relationship;

                await session.writeTransaction((tx) =>
                    tx.run(
                        `
                            MATCH
                                (a),
                                (b)
                            WHERE a.fullyQualifiedName = $fromNamespace AND b.fullyQualifiedName = $toNamespace
                            CREATE (a)-[r:` +
                            usageType.toUpperCase() +
                            `]->(b)
                        `,
                        { fromNamespace, toNamespace, usageType }
                    )
                );
            }
        } finally {
            await session.close();
        }

        // on application exit:
        await driver.close();
    }
}
