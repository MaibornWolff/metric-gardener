import { ExpressionMetricMapping } from "../parser/helper/Model";
import fs from "fs";
import nodeTypesConfig from "../parser/config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Maps the abbreviations of all available languages (as they are used inside the nodeTypesConfig.json) to
 * the location of the node-types.json of the corresponding grammar.
 */
export const languageAbbreviationToNodeTypeFiles = new Map([
    ["cs", "./node_modules/tree-sitter-c-sharp/src/node-types.json"],
    ["go", "./node_modules/tree-sitter-go/src/node-types.json"],
    ["java", "./node_modules/tree-sitter-java/src/node-types.json"],
    ["js", "./node_modules/tree-sitter-javascript/src/node-types.json"],
    ["kt", "./node_modules/tree-sitter-kotlin/src/node-types.json"],
    ["php", "./node_modules/tree-sitter-php/src/node-types.json"],
    ["ts", "./node_modules/tree-sitter-typescript/typescript/src/node-types.json"],
    ["py", "./node_modules/tree-sitter-python/src/node-types.json"],
    ["cpp", "./node_modules/tree-sitter-cpp/src/node-types.json"],
]);

export const pathToNodeTypesConfig = "./src/parser/config/nodeTypesConfig.json";

const expressionMappings: Map<string, ExpressionMetricMapping> = new Map();

/**
 * Updates the node mappings for calculating metrics with the currently installed language grammars.
 * Keeps the present mappings if the corresponding node type is still present in that language.
 * Removes all node types which are no longer present in the grammar.
 */
export async function updateNodeMappings() {
    const presentNodeTypesForLanguage = importPresentMappings();
    const removedNodeTypesForLanguage = new Map<string, Set<string>>();

    const updatePromises: Promise<unknown>[] = [];

    for (const languageAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
        let presentNodeTypes = presentNodeTypesForLanguage.get(languageAbbr);

        if (presentNodeTypes === undefined) {
            presentNodeTypes = new Set();
        }
        const promise = updateLanguage(languageAbbr, presentNodeTypes).then((removed) =>
            removedNodeTypesForLanguage.set(languageAbbr, removed)
        );
        updatePromises.push(promise);
    }

    await Promise.all(updatePromises);
    applyRemovedNodeTypes(removedNodeTypesForLanguage);

    // Save the updated mappings:
    fs.promises
        .writeFile(
            pathToNodeTypesConfig,
            JSON.stringify(Array.from(expressionMappings.values()), null, 4)
        )
        .then(
            () => {
                console.log("####################################");
                console.log(
                    'Successfully updated node type mappings. File saved to "' +
                        pathToNodeTypesConfig +
                        '".'
                );
            },
            (reason) => {
                console.error("Error while writing nodeTypesConfig.json");
                console.error(reason);
            }
        );
}

function importPresentMappings(): Map<string, Set<string>> {
    expressionMappings.clear();

    const presentNodeTypesForLanguage: Map<string, Set<string>> = new Map();
    for (const langAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
        presentNodeTypesForLanguage.set(langAbbr, new Set());
    }

    const allNodeTypes: ExpressionMetricMapping[] = nodeTypesConfig as ExpressionMetricMapping[];

    for (const nodeType of allNodeTypes) {
        expressionMappings.set(nodeType.expression, nodeType);

        for (const presentLangAbbr of nodeType.languages) {
            presentNodeTypesForLanguage.get(presentLangAbbr)?.add(nodeType.expression);
        }
    }

    return presentNodeTypesForLanguage;
}

async function updateLanguage(
    languageAbbr: string,
    presentNodes: Set<string>
): Promise<Set<string>> {
    const fileLocation = languageAbbreviationToNodeTypeFiles.get(languageAbbr);
    if (fileLocation === undefined) {
        console.error("No file path found for language " + languageAbbr);
        return new Set(); // Abort without changes to the expression mappings and no node removed.
    }

    const nodeTypesPromise = fs.promises.readFile(fileLocation, "utf8").catch((reason) => {
        console.error("Error while reading a node-types.json file from " + fileLocation);
        console.error(reason);
        return null;
    });

    const nodeTypesJson = await nodeTypesPromise;
    if (nodeTypesJson === null) {
        return new Set();
    }

    let nodeTypes;
    try {
        nodeTypes = JSON.parse(nodeTypesJson);
    } catch (e) {
        console.error("Error while parsing the json-file " + fileLocation);
        console.error(e);
        return new Set();
    }

    const removedNodeTypes: Set<string> = new Set(presentNodes);

    for (const nodeType of nodeTypes) {
        // Ignore all unnamed syntax nodes that are no binary expressions (as we require them) to get a "kind of"
        // abstract syntax tree by removing syntax details.
        // See also https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes
        if (!nodeType.named) {
            dlog("Excluded unnamed node type " + nodeType.type + " for language " + languageAbbr);
            continue;
        }

        if (nodeType.type === "binary_expression") {
            if (nodeType?.fields?.operator?.types !== undefined) {
                for (const binaryOperatorType of nodeType.fields.operator.types) {
                    const { type: binaryOperator } = binaryOperatorType;
                    const mapKey = nodeType.type + "_" + binaryOperator;
                    removedNodeTypes.delete(mapKey);

                    if (expressionMappings.has(mapKey)) {
                        if (!expressionMappings.get(mapKey)?.languages.includes(languageAbbr)) {
                            expressionMappings.get(mapKey)?.languages.push(languageAbbr);
                            dlog(
                                "Language " +
                                    languageAbbr +
                                    ' was added to node type "' +
                                    mapKey +
                                    '".'
                            );
                        }
                    } else {
                        expressionMappings.set(mapKey, {
                            expression: mapKey,
                            metrics: [],
                            type: "statement",
                            category: "binary_expression",
                            languages: [languageAbbr],
                            operator: binaryOperator,
                        });
                        dlog(
                            'New node type "' +
                                mapKey +
                                '" was added for language "' +
                                languageAbbr +
                                '".'
                        );
                    }
                }
            }
            continue;
        }

        removedNodeTypes.delete(nodeType.type);

        if (expressionMappings.has(nodeType.type)) {
            if (!expressionMappings.get(nodeType.type)?.languages.includes(languageAbbr)) {
                expressionMappings.get(nodeType.type)?.languages.push(languageAbbr);
                dlog(
                    'Language "' +
                        languageAbbr +
                        '" was added to node type "' +
                        nodeType.type +
                        '".'
                );
            }
        } else {
            expressionMappings.set(nodeType.type, {
                expression: nodeType.type,
                metrics: [],
                type: "statement",
                category: "",
                languages: [languageAbbr],
            });
            dlog(
                'New node type "' +
                    nodeType.type +
                    '" was added for language "' +
                    languageAbbr +
                    '".'
            );
        }

        if (nodeType.subtypes !== undefined) {
            for (const subNodeType of nodeType.subtypes) {
                removedNodeTypes.delete(subNodeType.type);

                if (expressionMappings.has(subNodeType.type)) {
                    if (
                        !expressionMappings.get(subNodeType.type)?.languages.includes(languageAbbr)
                    ) {
                        expressionMappings.get(subNodeType.type)?.languages.push(languageAbbr);
                        dlog(
                            'Language "' +
                                languageAbbr +
                                '" was added to node type "' +
                                nodeType.type +
                                '".'
                        );
                    }
                } else {
                    expressionMappings.set(subNodeType.type, {
                        expression: subNodeType.type,
                        metrics: [],
                        type: "statement",
                        category: "",
                        languages: [languageAbbr],
                    });
                    dlog(
                        'New node type "' +
                            nodeType.type +
                            '" was added for language "' +
                            languageAbbr +
                            '".'
                    );
                }
            }
        }
    }

    return removedNodeTypes;
}

function applyRemovedNodeTypes(removedNodeTypesForLanguage: Map<string, Set<string>>) {
    const nodesToRemove: string[] = [];

    for (const [nodeName, nodeType] of expressionMappings) {
        const updatedLanguages: string[] = [];
        // Keep only languages for which the node type has not been removed from the language's grammar:
        for (let i = 0; i < nodeType.languages.length; i++) {
            const currentLangAbbr = nodeType.languages[i];
            if (!removedNodeTypesForLanguage.get(currentLangAbbr)?.has(nodeName)) {
                updatedLanguages.push(currentLangAbbr);
            } else {
                dlog(
                    'Node type "' +
                        nodeName +
                        '" was removed for language "' +
                        currentLangAbbr +
                        '".'
                );
                if (
                    nodeType.metrics.length > 0 &&
                    (nodeType.activated_for_languages === undefined ||
                        nodeType.activated_for_languages.includes(currentLangAbbr))
                ) {
                    console.warn(
                        '## Attention required! Language "' +
                            currentLangAbbr +
                            '" no longer includes the node type "' +
                            nodeName +
                            '", which was used for calculating the metric(s) ' +
                            nodeType.metrics +
                            ". You may have to add a new node of that language to the metric(s) in nodeTypesConfig.json. ##"
                    );
                }
            }
        }
        if (updatedLanguages.length === 0) {
            nodesToRemove.push(nodeName);
        }
        nodeType.languages = updatedLanguages;
    }

    for (const nodeName of nodesToRemove) {
        const nodeType = expressionMappings.get(nodeName);
        if (nodeType !== undefined && nodeType.metrics.length > 0) {
            console.warn(
                '#### Intervention required! Removing the node type "' +
                    nodeName +
                    '", which was used for calculating the metric(s) ' +
                    nodeType.metrics +
                    ". You may have to add a new node to the metric(s) in nodeTypesConfig.json. ####"
            );
        }
        expressionMappings.delete(nodeName);
        dlog("Removed node type " + nodeName + " as it is no longer used in any language grammar");
    }
}
