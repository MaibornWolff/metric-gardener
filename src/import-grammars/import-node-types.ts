import fs from "node:fs/promises";
import { debuglog, type DebugLoggerFunction } from "node:util";
import { type NodeTypeConfig, NodeTypeCategory } from "../helper/model.js";
import nodeTypesConfig from "../parser/config/node-types-config.json" with { type: "json" };
import { type NodeType, type NodeTypes } from "../helper/node-types.js";
import { Language } from "../helper/language.js";
import { NodeTypesChangelog } from "./node-types-changelog.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});

/**
 * Maps all available languages (as they are used inside the node-types-config.json) to
 * the location of the node-types.json of the corresponding grammar.
 */
const languageToNodeTypeFiles = new Map<Language, string>([
    [Language.CSharp, "./node_modules/tree-sitter-c-sharp/src/node-types.json"],
    [Language.Go, "./node_modules/tree-sitter-go/src/node-types.json"],
    [Language.Java, "./node_modules/tree-sitter-java/src/node-types.json"],
    [Language.JavaScript, "./node_modules/tree-sitter-javascript/src/node-types.json"],
    [Language.Kotlin, "./node_modules/tree-sitter-kotlin/src/node-types.json"],
    [Language.PHP, "./node_modules/tree-sitter-php/php/src/node-types.json"],
    [Language.TypeScript, "./node_modules/tree-sitter-typescript/typescript/src/node-types.json"],
    [Language.TSX, "./node_modules/tree-sitter-typescript/tsx/src/node-types.json"],
    [Language.Python, "./node_modules/tree-sitter-python/src/node-types.json"],
    [Language.CPlusPlus, "./node_modules/tree-sitter-cpp/src/node-types.json"],
    [Language.Ruby, "./node_modules/tree-sitter-ruby/src/node-types.json"],
    [Language.Rust, "./node_modules/tree-sitter-rust/src/node-types.json"],
    [Language.Bash, "./node_modules/tree-sitter-bash/src/node-types.json"],
    [Language.C, "./node_modules/tree-sitter-c/src/node-types.json"],
    [Language.JSON, "./node_modules/tree-sitter-json/src/node-types.json"],
    [Language.YAML, "./node_modules/tree-sitter-yaml/src/node-types.json"],
]);

const pathToNodeTypesConfig = "./src/parser/config/node-types-config.json";

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

        for (const language of languageToNodeTypeFiles.keys()) {
            const presentNodeTypes = languageToPresentNodeTypes.get(language);
            const nodeTypesPromise = languageToNodeTypePromises.get(language);

            // Await reading node-types.json for the language:
            const nodeTypesJson = await nodeTypesPromise; // eslint-disable-line no-await-in-loop
            if (!nodeTypesJson) {
                throw new Error("No node-types.json found for language " + language);
            }

            if (nodeTypesJson instanceof Error) {
                throw nodeTypesJson;
            }

            updateLanguage(language, presentNodeTypes, nodeTypesJson);
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
        console.error("Error while writing node-types-config.json");
        console.error(error);
    }
}

function readNodeTypesJsons(): Map<string, Promise<string | Error>> {
    const languageToNodeTypePromises = new Map<string, Promise<string | Error>>();

    for (const [language, fileLocation] of languageToNodeTypeFiles.entries()) {
        const json = fs.readFile(fileLocation, "utf8").catch((error: unknown) => {
            return new Error(
                `Error while reading a node-types.json file from ${fileLocation}:\n${String(error)}`,
            ); // To be handled when awaiting the result.
        });
        languageToNodeTypePromises.set(language, json);
    }

    return languageToNodeTypePromises;
}

function importPresentNodeTypeMappings(): Map<string, Set<string>> {
    const presentNodeTypesForLanguage = new Map<string, Set<string>>();
    for (const language of languageToNodeTypeFiles.keys()) {
        presentNodeTypesForLanguage.set(language, new Set());
    }

    const allNodeTypes = nodeTypesConfig as NodeTypeConfig[];

    for (const nodeType of allNodeTypes) {
        nodeTypeMappings.set(nodeType.type_name, nodeType);

        for (const language of nodeType.languages) {
            presentNodeTypesForLanguage.get(language)?.add(nodeType.type_name);
        }
    }

    return presentNodeTypesForLanguage;
}

function updateLanguage(
    language: Language,
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
            dlog(`Excluded unnamed node type ${grammarNodeType.type} for language ${language}`);
            continue;
        }

        if (grammarNodeType.type === "binary_expression") {
            updateBinaryExpressions(language, grammarNodeType, toRemove);
            continue;
        }

        if (grammarNodeType.subtypes === undefined) {
            toRemove.delete(grammarNodeType.type);
            updateOrAddExpression(language, grammarNodeType.type);
        } else {
            // Do only include the (concrete) subtypes of a supertype node (types that have subtypes),
            // as supertypes represent abstract categories of syntax nodes
            // (see https://tree-sitter.github.io/tree-sitter/using-parsers).
            for (const subNodeType of grammarNodeType.subtypes) {
                toRemove.delete(subNodeType.type);
                updateOrAddExpression(language, subNodeType.type);
            }
        }
    }

    removeNodeTypesForLanguage(language, toRemove);
}

function updateBinaryExpressions(
    language: Language,
    grammarNodeType: NodeType,
    removedNodeTypes: Set<string>,
): void {
    if (grammarNodeType.fields?.operator?.types !== undefined) {
        for (const binaryOperatorType of grammarNodeType.fields.operator.types) {
            const { type: binaryOperator } = binaryOperatorType;
            const mapKey = grammarNodeType.type + "_" + binaryOperator;
            removedNodeTypes.delete(mapKey);

            updateOrAddExpression(
                language,
                mapKey,
                NodeTypeCategory.OtherBinaryExpression, // Can be adjusted manually in the node-types-config later
                grammarNodeType.type,
                binaryOperator,
            );
        }
    }
}

/**
 * Adds the node type to the specified language.
 * Either updates an existing mapping for that node type or adds a new node type to the mappings.
 * @param language Language to add this node type to.
 * @param nodeTypeName Name of the node type.
 * @param category Category of the node type to use if a new node type mapping is created.
 * @param grammarNodeTypeName Name of the node type in the grammar, if different to the nodeTypeName.
 * @param operator Operator of the node type to use if a new node type mapping is created.
 */
function updateOrAddExpression(
    language: Language,
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
            languages: [language],
            grammar_type_name: grammarNodeTypeName,
            operator,
        });
        changelog.addedNewNode(nodeTypeName, language);
        dlog('New node type "' + nodeTypeName + '" was added for language "' + language + '".');
    } else if (!nodeType.languages.includes(language)) {
        changelog.addedNodeToLanguage(nodeType, language);
        nodeType.languages.push(language);
        dlog('Language "' + language + '" was added to node type "' + nodeTypeName + '".');
    }
}

function removeNodeTypesForLanguage(language: Language, removedNodeTypes: Set<string>): void {
    for (const [nodeTypeName, nodeType] of nodeTypeMappings) {
        if (removedNodeTypes.has(nodeTypeName)) {
            const index = nodeType.languages.indexOf(language);
            nodeType.languages.splice(index, 1);

            changelog.removedNodeFromLanguage(nodeType, language);
            dlog('Node type "' + nodeTypeName + '" was removed for language "' + language + '".');
            if (
                nodeType.category !== NodeTypeCategory.Other &&
                !nodeType.deactivated_for_languages?.includes(language)
            ) {
                console.warn(
                    '## Attention required! Language "' +
                        language +
                        '" no longer includes the node type "' +
                        nodeTypeName +
                        '", which was used for calculating metric(s) under the category ' +
                        nodeType.category +
                        ". You may have to add a new node of that language to this category in node-types-config.json. ##",
                );
            }

            if (nodeType.deactivated_for_languages?.includes(language)) {
                const obsolete = obsoleteDeactivatedLanguages.get(nodeTypeName) ?? [];
                obsolete.push(language);
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
                        ". You may have to add a new node to the metric(s) in node-types-config.json. ####",
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
