import { ExpressionMetricMapping } from "../../parser/helper/Model";
import fs from "fs";
import nodeTypesConfig from "../../parser/config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";
import { NodeTypesChangelog } from "./NodeTypesChangelog";

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
const changelog: NodeTypesChangelog = new NodeTypesChangelog();

/**
 * Updates the node mappings for calculating metrics by importing the node-types.json files of the currently
 * installed language grammars.
 * Keeps the present mappings if the corresponding node type is still present in that language.
 * Removes all node types which are no longer present in the grammar.
 */
export async function updateNodeTypesMappingFile() {
    expressionMappings.clear();
    changelog.clear();

    try {
        const languageAbbrToNodeTypePromises = readNodeTypesJsons();
        if (languageAbbrToNodeTypePromises === null) {
            return; // Cancel whole update. Error message was already printed by readNodeTypesJsons()
        }

        const languageToPresentNodeTypes = importPresentNodeTypeMappings();

        for (const languageAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
            let presentNodeTypes = languageToPresentNodeTypes.get(languageAbbr);

            if (presentNodeTypes === undefined) {
                presentNodeTypes = new Set();
            }

            const nodeTypesPromise = languageAbbrToNodeTypePromises.get(languageAbbr);
            let success = false;

            if (nodeTypesPromise !== undefined) {
                // This is synchronized on purpose to make the output comparable.
                success = await updateLanguage(languageAbbr, presentNodeTypes, nodeTypesPromise);
            }

            if (!success) {
                console.error("Error while updating the node mappings. Cancel update...");
                return;
            }
        }

        // Make sure to write the change information before deleting any metric mapping.
        // If there is an error, catch that in the updateNodeMappings() and cancel the whole update.
        await changelog.writeChangelog(expressionMappings);
        await removeAbandonedNodeTypes();
    } catch (e) {
        console.error("Error while updating the node mappings. Cancel update...");
        console.error(e);
        return;
    }

    await writeNewNodeTypeMappings();
}

function readNodeTypesJsons(): Map<string, Promise<string | null>> | null {
    const languageAbbrToNodeTypePromises = new Map<string, Promise<string | null>>();

    for (const languageAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
        const fileLocation = languageAbbreviationToNodeTypeFiles.get(languageAbbr);
        if (fileLocation === undefined) {
            console.error("No file path found for language " + languageAbbr + ". Cancel update...");
            return null; // Cancel whole update.
        }

        languageAbbrToNodeTypePromises.set(
            languageAbbr,
            fs.promises.readFile(fileLocation, "utf8").catch((reason) => {
                console.error("Error while reading a node-types.json file from " + fileLocation);
                console.error(reason);
                return null; // To be handled when awaiting the result.
            })
        );
    }
    return languageAbbrToNodeTypePromises;
}

function importPresentNodeTypeMappings(): Map<string, Set<string>> {
    const presentNodeTypesForLanguage: Map<string, Set<string>> = new Map();
    for (const langAbbr of languageAbbreviationToNodeTypeFiles.keys()) {
        presentNodeTypesForLanguage.set(langAbbr, new Set());
    }

    const allNodeTypes = nodeTypesConfig as ExpressionMetricMapping[];

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
    presentNodes: Set<string>,
    nodeTypesPromise: Promise<string | null>
) {
    let grammarNodeTypes;
    try {
        // Await reading node-types.json for the language:
        const nodeTypesJson = await nodeTypesPromise;
        if (nodeTypesJson === null) {
            return false;
        }

        grammarNodeTypes = JSON.parse(nodeTypesJson);
    } catch (e) {
        console.error("Error while parsing the node-types.json file for language " + languageAbbr);
        console.error(e);
        return false;
    }

    const toRemove: Set<string> = new Set(presentNodes);

    for (const grammarNodeType of grammarNodeTypes) {
        // Ignore all unnamed syntax nodes that are no binary expressions (as we require them) to get a "kind of"
        // abstract syntax tree by removing syntax details.
        // See also https://tree-sitter.github.io/tree-sitter/using-parsers#named-vs-anonymous-nodes
        if (!grammarNodeType.named) {
            dlog(
                "Excluded unnamed node type " +
                    grammarNodeType.type +
                    " for language " +
                    languageAbbr
            );
            continue;
        }

        if (grammarNodeType.type === "binary_expression") {
            updateBinaryExpressions(languageAbbr, presentNodes, grammarNodeType, toRemove);
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
    return true;
}

function updateBinaryExpressions(
    languageAbbr: string,
    presentNodes: Set<string>,
    grammarNodeType,
    removedNodeTypes: Set<string>
) {
    if (grammarNodeType?.fields?.operator?.types !== undefined) {
        for (const binaryOperatorType of grammarNodeType.fields.operator.types) {
            const { type: binaryOperator } = binaryOperatorType;
            const mapKey = grammarNodeType.type + "_" + binaryOperator;
            removedNodeTypes.delete(mapKey);

            updateOrAddExpression(languageAbbr, mapKey, "binary_expression", binaryOperator);
        }
    }
}

/**
 * Adds the expression to the specified language.
 * Either updates an existing mapping for that expression or adds a new the expression to the expression mappings.
 * @param languageAbbr Abbreviation of the language to add this expression to.
 * @param expressionName Name of the expression.
 * @param category Category of the expression to use if a new expression mapping is created.
 * @param operator Operator of the expression to use if a new expression mapping is created.
 */
function updateOrAddExpression(
    languageAbbr: string,
    expressionName: string,
    category = "",
    operator?
) {
    const expression = expressionMappings.get(expressionName);

    if (expression !== undefined) {
        if (!expression.languages.includes(languageAbbr)) {
            changelog.addedNodeToLanguage(expression, languageAbbr);
            expression.languages.push(languageAbbr);
            dlog(
                'Language "' + languageAbbr + '" was added to node type "' + expressionName + '".'
            );
        }
    } else {
        expressionMappings.set(expressionName, {
            expression: expressionName,
            metrics: [],
            type: "statement",
            category: category,
            languages: [languageAbbr],
            operator: operator,
        });
        changelog.addedNewNode(expressionName, languageAbbr);
        dlog(
            'New node type "' + expressionName + '" was added for language "' + languageAbbr + '".'
        );
    }
}

function removeNodeTypesForLanguage(languageAbbr: string, removedNodeTypes: Set<string>) {
    for (const [expressionName, expression] of expressionMappings) {
        if (removedNodeTypes.has(expressionName)) {
            const index = expression.languages.indexOf(languageAbbr);
            expression.languages.splice(index, 1);

            changelog.removedNodeFromLanguage(expression, languageAbbr);
            dlog(
                'Expression "' +
                    expressionName +
                    '" was removed for language "' +
                    languageAbbr +
                    '".'
            );
            if (
                expression.metrics.length > 0 &&
                (expression.activated_for_languages === undefined ||
                    expression.activated_for_languages.includes(languageAbbr))
            ) {
                console.warn(
                    '## Attention required! Language "' +
                        languageAbbr +
                        '" no longer includes the node type "' +
                        expressionName +
                        '", which was used for calculating the metric(s) ' +
                        expression.metrics +
                        ". You may have to add a new node of that language to the metric(s) in nodeTypesConfig.json. ##"
                );
            }
        }
    }
}

async function removeAbandonedNodeTypes(): Promise<void> {
    for (const [expressionName, expression] of expressionMappings) {
        if (expression.languages.length === 0) {
            if (expression.metrics.length > 0) {
                console.warn(
                    '#### Intervention required! Removing the node type "' +
                        expressionName +
                        '", which was used for calculating the metric(s) ' +
                        expression.metrics +
                        ". You may have to add a new node to the metric(s) in nodeTypesConfig.json. ####"
                );
            }
            expressionMappings.delete(expressionName);
            dlog(
                "Removed node type " +
                    expressionName +
                    " as it is no longer used in any language grammar"
            );
        }
    }
}

async function writeNewNodeTypeMappings() {
    try {
        // Save the updated mappings:
        await fs.promises.writeFile(
            pathToNodeTypesConfig,
            JSON.stringify(Array.from(expressionMappings.values()), null, 4)
        );
        console.log("####################################");
        console.log(
            'Successfully updated node type mappings. File saved to "' +
                pathToNodeTypesConfig +
                '".'
        );
        console.log("####################################");
    } catch (e) {
        console.error("Error while writing nodeTypesConfig.json");
        console.error(e);
    }
}
