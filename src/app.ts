import { GenericParser } from "./GenericParser";
import fs from "fs";

export interface ExpressionMetricMapping {
    expression: string;
    metrics: string[];
    type: "statement" | "keyword";
    languages: string[];
    category: string;
    operator?: string;
}

const nodeTypeConfigPath = "./resources";
const resourcesRoot = process.argv[2] ?? "./resources";

console.log(resourcesRoot);

const nodeTypeFiles = new Map([
    ["cs", "./node_modules/tree-sitter-c-sharp/src/node-types.json"],
    ["go", "./node_modules/tree-sitter-go/src/node-types.json"],
    ["java", "./node_modules/tree-sitter-java/src/node-types.json"],
    ["js", "./node_modules/tree-sitter-javascript/src/node-types.json"],
    ["kt", "./node_modules/tree-sitter-kotlin/src/node-types.json"],
    ["php", "./node_modules/tree-sitter-php/src/node-types.json"],
    ["ts", "./node_modules/tree-sitter-typescript/typescript/src/node-types.json"],
]);

export const binaryOperatorTranslations = new Map([
    ["&&", "logical_and"],
    ["||", "logical_or"],
    ["??", "null_or_value"],
    ["and", "and"],
    ["or", "or"],
    ["xor", "xor"],
]);
const expressionMappings: Map<string, ExpressionMetricMapping> = new Map();

for (const [language, nodeTypesFile] of nodeTypeFiles) {
    const nodeTypes = JSON.parse(fs.readFileSync(nodeTypesFile, "utf8"));

    for (const nodeType of nodeTypes) {
        if (nodeType.type === "binary_expression") {
            if (nodeType?.fields?.operator?.types !== undefined) {
                for (const binaryOperatorType of nodeType.fields.operator.types) {
                    const { type: binaryOperator } = binaryOperatorType;
                    const mapKey =
                        nodeType.type + "_" + binaryOperatorTranslations.get(binaryOperator);

                    if (expressionMappings.has(mapKey)) {
                        if (!expressionMappings.get(mapKey).languages.includes(language)) {
                            expressionMappings.get(mapKey).languages.push(language);
                        }
                    } else {
                        expressionMappings.set(mapKey, {
                            expression: mapKey,
                            metrics: [],
                            type: "statement",
                            category: "binary_expression",
                            languages: [language],
                            operator: binaryOperator,
                        });
                    }
                }
            }
            continue;
        }

        if (expressionMappings.has(nodeType.type)) {
            if (!expressionMappings.get(nodeType.type).languages.includes(language)) {
                expressionMappings.get(nodeType.type).languages.push(language);
            }
        } else {
            expressionMappings.set(nodeType.type, {
                expression: nodeType.type,
                metrics: [],
                type: "statement",
                category: "",
                languages: [language],
            });
        }

        if (nodeType.subtypes !== undefined) {
            for (const subNodeType of nodeType.subtypes) {
                if (expressionMappings.has(subNodeType.type)) {
                    if (!expressionMappings.get(subNodeType.type).languages.includes(language)) {
                        expressionMappings.get(subNodeType.type).languages.push(language);
                    }
                } else {
                    expressionMappings.set(subNodeType.type, {
                        expression: subNodeType.type,
                        metrics: [],
                        type: "statement",
                        category: "",
                        languages: [language],
                    });
                }
            }
        }
    }
}

fs.writeFileSync(
    fs.realpathSync(nodeTypeConfigPath + "/node-types.config"),
    JSON.stringify(Array.from(expressionMappings.values()), null, 4).toString()
);

// console.log = () => {
//     return
// }

const parser = new GenericParser();
const fileMetrics = parser.calculateMetrics(resourcesRoot);

console.log("\n\n");
console.log("#####################################");
console.log("#####################################");
console.log(fileMetrics);

interface CodeChartaNode {
    name: string;
    type: "File";
    attributes: { [key: string]: number };
    link: "";
    children: [];
}

interface CodeChartaEdge {
    fromNodeName: string;
    toNodeName: string;
    attributes: {
        coupling: 100.0;
    };
}

const output: { nodes: CodeChartaNode[]; edges: CodeChartaEdge[] } = { nodes: [], edges: [] };

for (const [filePath, metricsMap] of fileMetrics.entries()) {
    const metrics: { [key: string]: number } = {};

    for (const [metricName, metricValue] of metricsMap.entries()) {
        metrics[metricName] = metricValue.metricValue;
    }

    // add manually to each node
    metrics["coupling"] = 100;

    output.nodes.push({
        name: filePath,
        type: "File",
        attributes: metrics,
        link: "",
        children: [],
    });
}

const edgeMetrics = parser.getEdgeMetrics();
const couplingMetricResults = edgeMetrics.metricValue;

for (const couplingMetricResult of couplingMetricResults) {
    output.edges.push({
        fromNodeName: couplingMetricResult.fromSource,
        toNodeName: couplingMetricResult.toSource,
        attributes: { coupling: 100.0 },
    });
}

fs.writeFileSync(
    fs.realpathSync(nodeTypeConfigPath + "/output.json"),
    JSON.stringify(output, null, 4).toString()
);
