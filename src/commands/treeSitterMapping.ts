import { binaryOperatorTranslations, ExpressionMetricMapping } from "../parser/helper/Model";
import fs from "fs";

const nodeTypeConfigPath = "./resources";

const nodeTypeFiles = new Map([
    ["cs", "./node_modules/tree-sitter-c-sharp/src/node-types.json"],
    ["go", "./node_modules/tree-sitter-go/src/node-types.json"],
    ["java", "./node_modules/tree-sitter-java/src/node-types.json"],
    ["js", "./node_modules/tree-sitter-javascript/src/node-types.json"],
    ["kt", "./node_modules/tree-sitter-kotlin/src/node-types.json"],
    ["php", "./node_modules/tree-sitter-php/src/node-types.json"],
    ["ts", "./node_modules/tree-sitter-typescript/typescript/src/node-types.json"],
]);

const expressionMappings: Map<string, ExpressionMetricMapping> = new Map();

export function generateNodeTypesMappingFile() {
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
                        if (
                            !expressionMappings.get(subNodeType.type).languages.includes(language)
                        ) {
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
}
