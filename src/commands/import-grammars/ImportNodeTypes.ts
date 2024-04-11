import fs from "node:fs/promises";
import { debuglog, type DebugLoggerFunction } from "node:util";
import { type NodeTypeConfig, NodeTypeCategory } from "../../parser/helper/Model.js";
import nodeTypesConfig from "../../parser/config/nodeTypesConfig.json" with { type: "json" };
import { NodeTypesChangelog } from "./NodeTypesChangelog.js";
import { type NodeType, type NodeTypes } from "./NodeTypes.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Maps the abbreviations of all available languages (as they are used inside the nodeTypesConfig.json) to
 * the location of the node-types.json of the corresponding grammar.
 */
const languageAbbreviationToNodeTypeFiles = new Map([
    ["cs", "./node_modules/tree-sitter-c-sharp/src/node-types.json"],
    ["go", "./node_modules/tree-sitter-go/src/node-types.json"],
    ["java", "./node_modules/tree-sitter-java/src/node-types.json"],
    ["js", "./node_modules/tree-sitter-javascript/src/node-types.json"],
    ["kt", "./node_modules/tree-sitter-kotlin/src/node-types.json"],
    ["php", "./node_modules/tree-sitter-php/php/src/node-types.json"],
    ["ts", "./node_modules/tree-sitter-typescript/typescript/src/node-types.json"],
    ["tsx", "./node_modules/tree-sitter-typescript/tsx/src/node-types.json"],
    ["py", "./node_modules/tree-sitter-python/src/node-types.json"],
    ["cpp", "./node_modules/tree-sitter-cpp/src/node-types.json"],
    ["rb", "./node_modules/tree-sitter-ruby/src/node-types.json"],
    ["rs", "./node_modules/tree-sitter-rust/src/node-types.json"],
    ["sh", "./node_modules/tree-sitter-bash/src/node-types.json"],
    ["c", "./node_modules/tree-sitter-c/src/node-types.json"],
    ["json", "./node_modules/tree-sitter-json/src/node-types.json"],
    ["yaml", "./node_modules/tree-sitter-yaml/src/node-types.json"],
]);

const pathToNodeTypesConfig = "./src/parser/config/nodeTypesConfig.json";

const nodeTypeMappings = new Map<string, NodeTypeConfig>();
const changelog = new NodeTypesChangelog();
const obsoleteDeactivatedLanguages = new Map<string, string[]>();

/**
 * Updates the node mappings for calculating metrics by importing the node-types.json files of the currently
 * installed language grammars.
 * Keeps the present mappings if the corresponding node type is still present in that language.
 * Removes all node types which are no longer present in the grammar.
 */
export async function updateNodeTypesMappingFile(): Promise<void> {
    nodeTypeMappings.clear();
    changelog.clear();

    try {
        const languageToNodeTypePromises = readNodeTypesJsons();
        const languageToPresentNodeTypes = importPresentNodeTypeMappings();

        for (const languageAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
            const presentNodeTypes = languageToPresentNodeTypes.get(languageAbbr);
            const nodeTypesPromise = languageToNodeTypePromises.get(languageAbbr);

            // Await reading node-types.json for the language:
            const nodeTypesJson = await nodeTypesPromise;
            if (!nodeTypesJson) {
                throw new Error("No node-types.json found for language " + languageAbbr);
            }

            if (nodeTypesJson instanceof Error) {
                throw nodeTypesJson;
            }

            updateLanguage(languageAbbr, presentNodeTypes, nodeTypesJson);
        }

        // Make sure to write the change information before deleting any metric mapping.
        await changelog.writeChangelog(nodeTypeMappings);
        removeObsolete();
    } catch (error) {
        console.error("Error while updating the node mappings. Cancel update...");
        console.error(error);
        return;
    }

    try {
        await writeNewNodeTypeMappings();
    } catch (error) {
        console.error("Error while writing nodeTypesConfig.json");
        console.error(error);
    }
}

function readNodeTypesJsons(): Map<string, Promise<string | Error>> {
    const languageAbbrToNodeTypePromises = new Map<string, Promise<string | Error>>();

    for (const [languageAbbr, fileLocation] of languageAbbreviationToNodeTypeFiles.entries()) {
        const json = fs.readFile(fileLocation, "utf8").catch((error: unknown) => {
            return new Error(
                `Error while reading a node-types.json file from ${fileLocation}:\n${String(error)}`,
            ); // To be handled when awaiting the result.
        });
        languageAbbrToNodeTypePromises.set(languageAbbr, json);
    }

    return languageAbbrToNodeTypePromises;
}

function importPresentNodeTypeMappings(): Map<string, Set<string>> {
    const presentNodeTypesForLanguage = new Map<string, Set<string>>();
    for (const langAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
        presentNodeTypesForLanguage.set(langAbbr, new Set());
    }

    const allNodeTypes = nodeTypesConfig as NodeTypeConfig[];

    for (const nodeType of allNodeTypes) {
        nodeTypeMappings.set(nodeType.type_name, nodeType);

        for (const presentLangAbbr of nodeType.languages) {
            presentNodeTypesForLanguage.get(presentLangAbbr)?.add(nodeType.type_name);
        }
    }

    return presentNodeTypesForLanguage;
}

function updateLanguage(
    languageAbbr: string,
    presentNodes: Set<string> | undefined,
    nodeTypesJson: string,
): void {
    const grammarNodeTypes = JSON.parse(nodeTypesJson) as NodeTypes;

    const toRemove = new Set<string>(presentNodes);
    for (const grammarNodeType of grammarNodeTypes) {
        // Ignore all unnamed syntax nodes that are no binary expressions (as we require them) to get a "kind of"
        // abstract syntax tree by removing syntax details.
        // See also https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes
        if (!grammarNodeType.named) {
            dlog(`Excluded unnamed node type ${grammarNodeType.type} for language ${languageAbbr}`);
            continue;
        }

        if (grammarNodeType.type === "binary_expression") {
            updateBinaryExpressions(languageAbbr, grammarNodeType, toRemove);
            continue;
        }

        if (grammarNodeType.subtypes === undefined) {
            toRemove.delete(grammarNodeType.type);
            updateOrAddExpression(languageAbbr, grammarNodeType.type);
        } else {
            // Do only include the (concrete) subtypes of a supertype node (types that have subtypes),
            // as supertypes represent abstract categories of syntax nodes
            // (see https://tree-sitter.github.io/tree-sitter/using-parsers).
            for (const subNodeType of grammarNodeType.subtypes) {
                toRemove.delete(subNodeType.type);
                updateOrAddExpression(languageAbbr, subNodeType.type);
            }
        }
    }

    removeNodeTypesForLanguage(languageAbbr, toRemove);
}

function updateBinaryExpressions(
    languageAbbr: string,
    grammarNodeType: NodeType,
    removedNodeTypes: Set<string>,
): void {
    if (grammarNodeType.fields?.operator?.types !== undefined) {
        for (const binaryOperatorType of grammarNodeType.fields.operator.types) {
            const { type: binaryOperator } = binaryOperatorType;
            const mapKey = grammarNodeType.type + "_" + binaryOperator;
            removedNodeTypes.delete(mapKey);

            updateOrAddExpression(
                languageAbbr,
                mapKey,
                NodeTypeCategory.OtherBinaryExpression, // Can be adjusted manually in the nodeTypesConfig later
                grammarNodeType.type,
                binaryOperator,
            );
        }
    }
}

/**
 * Adds the node type to the specified language.
 * Either updates an existing mapping for that node type or adds a new node type to the mappings.
 * @param languageAbbr Abbreviation of the language to add this node type to.
 * @param nodeTypeName Name of the node type.
 * @param category Category of the node type to use if a new node type mapping is created.
 * @param grammarNodeTypeName Name of the node type in the grammar, if different to the nodeTypeName.
 * @param operator Operator of the node type to use if a new node type mapping is created.
 */
function updateOrAddExpression(
    languageAbbr: string,
    nodeTypeName: string,
    category: NodeTypeCategory = NodeTypeCategory.Other,
    grammarNodeTypeName?: string,
    operator?: string,
): void {
    const nodeType = nodeTypeMappings.get(nodeTypeName);

    if (nodeType === undefined) {
        nodeTypeMappings.set(nodeTypeName, {
            type_name: nodeTypeName,
            category,
            languages: [languageAbbr],
            grammar_type_name: grammarNodeTypeName,
            operator,
        });
        changelog.addedNewNode(nodeTypeName, languageAbbr);
        dlog('New node type "' + nodeTypeName + '" was added for language "' + languageAbbr + '".');
    } else if (!nodeType.languages.includes(languageAbbr)) {
        changelog.addedNodeToLanguage(nodeType, languageAbbr);
        nodeType.languages.push(languageAbbr);
        dlog('Language "' + languageAbbr + '" was added to node type "' + nodeTypeName + '".');
    }
}

function removeNodeTypesForLanguage(languageAbbr: string, removedNodeTypes: Set<string>): void {
    for (const [nodeTypeName, nodeType] of nodeTypeMappings) {
        if (removedNodeTypes.has(nodeTypeName)) {
            const index = nodeType.languages.indexOf(languageAbbr);
            nodeType.languages.splice(index, 1);

            changelog.removedNodeFromLanguage(nodeType, languageAbbr);
            dlog(
                'Node type "' + nodeTypeName + '" was removed for language "' + languageAbbr + '".',
            );
            if (
                nodeType.category !== NodeTypeCategory.Other &&
                !nodeType.deactivated_for_languages?.includes(languageAbbr)
            ) {
                console.warn(
                    '## Attention required! Language "' +
                        languageAbbr +
                        '" no longer includes the node type "' +
                        nodeTypeName +
                        '", which was used for calculating metric(s) under the category ' +
                        nodeType.category +
                        ". You may have to add a new node of that language to this category in nodeTypesConfig.json. ##",
                );
            }

            if (nodeType.deactivated_for_languages?.includes(languageAbbr)) {
                const obsolete = obsoleteDeactivatedLanguages.get(nodeTypeName) || [];
                obsolete.push(languageAbbr);
                obsoleteDeactivatedLanguages.set(nodeTypeName, obsolete);
            }
        }
    }
}

function removeObsolete(): void {
    for (const [nodeTypeName, nodeType] of nodeTypeMappings) {
        if (nodeType.languages.length === 0) {
            if (nodeType.category !== NodeTypeCategory.Other) {
                console.warn(
                    '#### Intervention required! Removing the node type "' +
                        nodeTypeName +
                        '", which was used for calculating metric(s) under the category ' +
                        nodeType.category +
                        ". You may have to add a new node to the metric(s) in nodeTypesConfig.json. ####",
                );
            }

            nodeTypeMappings.delete(nodeTypeName);
            dlog(
                `Removed node type ${nodeTypeName} as it is no longer used in any language grammar`,
            );
        } else {
            const obsolete = obsoleteDeactivatedLanguages.get(nodeTypeName);
            nodeType.deactivated_for_languages = nodeType.deactivated_for_languages?.filter(
                (lang) => !obsolete?.includes(lang),
            );
            if (nodeType.deactivated_for_languages?.length === 0) {
                delete nodeType.deactivated_for_languages;
            }
        }
    }
}

async function writeNewNodeTypeMappings(): Promise<void> {
    // Save the updated mappings:
    await fs.writeFile(
        pathToNodeTypesConfig,
        JSON.stringify([...nodeTypeMappings.values()], null, 4),
    );
    console.log("####################################");
    console.log(
        'Successfully updated node type mappings. File saved to "' + pathToNodeTypesConfig + '".',
    );
    console.log("####################################");
}
