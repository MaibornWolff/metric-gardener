import { GenericParser } from "./GenericParser";
import fs from "fs";

export interface ExpressionMetricMapping {
    expression: string;
    metrics: string[];
    type: "statement" | "keyword";
}

const resourcesRoot = process.argv[2] ?? "./resources";

console.log(resourcesRoot);

const nodeTypeFiles = [
    "./node_modules/tree-sitter-c-sharp/src/node-types.json",
    "./node_modules/tree-sitter-go/src/node-types.json",
    "./node_modules/tree-sitter-java/src/node-types.json",
    "./node_modules/tree-sitter-javascript/src/node-types.json",
    "./node_modules/tree-sitter-kotlin/src/node-types.json",
    "./node_modules/tree-sitter-php/src/node-types.json",
    "./node_modules/tree-sitter-typescript/typescript/src/node-types.json",
]

const expressionMappings: Map<string, ExpressionMetricMapping> = new Map([]);

for (const nodeTypesFile of nodeTypeFiles) {
    const nodeTypes = JSON.parse(
        fs.readFileSync(nodeTypesFile, "utf8")
    );

    for (const nodeType of nodeTypes) {
        expressionMappings.set(nodeType.type, {
            expression: nodeType.type,
            metrics: [],
            type: "statement",
        });

        if (nodeType.subtypes !== undefined) {
            for (const subNodeType of nodeType.subtypes) {
                expressionMappings.set(subNodeType.type, {
                    expression: subNodeType.type,
                    metrics: [],
                    type: "statement",
                });
            }
        }
    }
}

fs.writeFileSync(fs.realpathSync(resourcesRoot + "/node-types.config"), JSON.stringify(Array.from(expressionMappings.values()),null,4).toString());


const parser = new GenericParser();
parser.calculateMetrics(resourcesRoot)