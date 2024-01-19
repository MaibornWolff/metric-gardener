import { ExpressionMetricMapping } from "../parser/helper/Model";
import fs from "fs";
import nodeTypesConfig from "../parser/config/nodeTypesConfig.json";
import { debuglog, DebugLoggerFunction } from "node:util";
import { EOL } from "os";
import { Changelog } from "./Changelog";

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
const pathToWriteChangelog = "./nodeTypeChanges.csv";
const csvSeparator = ";";

const expressionMappings: Map<string, ExpressionMetricMapping> = new Map();
const changelog: Changelog = new Changelog();

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
        const promise = updateLanguage(languageAbbr, presentNodeTypes).then(
            (removed) => {
                if (removed === null) {
                    return false;
                }
                removedNodeTypesForLanguage.set(languageAbbr, removed);
                return true;
            },
            (reason) => {
                console.error(reason);
                return false;
            }
        );

        updatePromises.push(promise);
    }

    try {
        const result = await Promise.all(updatePromises);
        if (result.includes(false)) {
            console.error("Error while updating the node mappings. Cancel update...");
            return;
        }
        await applyRemovedNodeTypes(removedNodeTypesForLanguage);
    } catch (e) {
        console.error("Error while updating the node mappings. Cancel update...");
        console.error(e);
        return;
    }

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
    changelog.clear();

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
): Promise<Set<string> | null> {
    const fileLocation = languageAbbreviationToNodeTypeFiles.get(languageAbbr);
    if (fileLocation === undefined) {
        console.error("No file path found for language " + languageAbbr);
        return null; // Cancel whole update.
    }

    const nodeTypesPromise = fs.promises.readFile(fileLocation, "utf8").catch((reason) => {
        console.error("Error while reading a node-types.json file from " + fileLocation);
        console.error(reason);
        return null;
    });

    const nodeTypesJson = await nodeTypesPromise;
    if (nodeTypesJson === null) {
        return null;
    }

    let nodeTypes;
    try {
        nodeTypes = JSON.parse(nodeTypesJson);
    } catch (e) {
        console.error("Error while parsing the json-file " + fileLocation);
        console.error(e);
        return null;
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

                    const expression = expressionMappings.get(mapKey);
                    if (expression !== undefined) {
                        if (!expression.languages.includes(languageAbbr)) {
                            expression.languages.push(languageAbbr);
                            changelog.addedNodeToLanguage(expression, languageAbbr);
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
                        changelog.addedNewNode(mapKey, languageAbbr);
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
                changelog.addedNodeToLanguage(nodeType.type, languageAbbr);
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
            changelog.addedNewNode(nodeType.type, languageAbbr);
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
                        changelog.addedNodeToLanguage(subNodeType.type, languageAbbr);
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
                    changelog.addedNewNode(subNodeType.type, languageAbbr);
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

function escapeForCsv(s: string) {
    const escaped = s.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/"/g, '""');
    return '"' + escaped + '"';
}

/**
 * Writes the changelog.
 * @return Promise that fulfills once the changelog has been written successfully.
 */
function writeChangelog() {
    return new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(pathToWriteChangelog);

        writeStream.on("error", (err) => {
            console.error("Error while writing the changelog:");
            console.error(err);
            reject();
        });
        writeStream.on("finish", () => {
            console.log('Saved overview of all changes to "' + pathToWriteChangelog + '".');
            resolve();
        });

        writeStream.write("Changelog for updating the expression mappings" + EOL);
        writeStream.write("New syntax nodes:" + EOL + EOL);
        writeStream.write("Name:" + csvSeparator + "Added to language(s):" + EOL);

        for (const entry of changelog.getAll().values()) {
            if (entry.isNew) {
                writeStream.write(
                    escapeForCsv(entry.expression) +
                        csvSeparator +
                        Array.from(entry.addedLanguages) +
                        EOL
                );
            }
        }

        writeStream.write(EOL + "Removed syntax nodes:" + EOL);
        writeStream.write(
            "Name:" +
                csvSeparator +
                "Removed from language(s):" +
                csvSeparator +
                "Used for calculating the metric(s):" +
                csvSeparator +
                "Was explicitly only activated for language(s):" +
                EOL
        );

        for (const entry of changelog.getAll().values()) {
            if (entry.remainingLanguages.size + entry.addedLanguages.size === 0) {
                const mapping = expressionMappings.get(entry.expression);
                if (mapping !== undefined) {
                    const activatedForLangOutput =
                        mapping.activated_for_languages === undefined
                            ? ""
                            : mapping.activated_for_languages;
                    writeStream.write(
                        escapeForCsv(entry.expression) +
                            csvSeparator +
                            Array.from(entry.removedLanguages) +
                            csvSeparator +
                            mapping.metrics +
                            csvSeparator +
                            activatedForLangOutput +
                            EOL
                    );
                } else {
                    console.error(
                        "Programming mistake: No existing expression mapping for a syntax node that is not new: " +
                            entry.expression
                    );
                }
            }
        }

        writeStream.write(
            EOL + "Syntax nodes which were removed from or added to languages:" + EOL
        );
        writeStream.write(
            "Name:" +
                csvSeparator +
                "Added to language(s):" +
                csvSeparator +
                "Removed from language(s):" +
                csvSeparator +
                "Remains in language(s):" +
                csvSeparator +
                "Used for calculating the metric(s):" +
                csvSeparator +
                "Was explicitly only activated for language(s):" +
                EOL
        );

        for (const entry of changelog.getAll().values()) {
            if (entry.remainingLanguages.size + entry.addedLanguages.size > 0) {
                const mapping = expressionMappings.get(entry.expression);
                if (mapping !== undefined) {
                    const activatedForLangOutput =
                        mapping.activated_for_languages === undefined
                            ? ""
                            : mapping.activated_for_languages;
                    writeStream.write(
                        escapeForCsv(entry.expression) +
                            csvSeparator +
                            Array.from(entry.addedLanguages) +
                            csvSeparator +
                            Array.from(entry.removedLanguages) +
                            csvSeparator +
                            Array.from(entry.remainingLanguages) +
                            csvSeparator +
                            mapping.metrics +
                            csvSeparator +
                            activatedForLangOutput +
                            EOL
                    );
                } else {
                    console.error(
                        "Programming mistake: No existing expression mapping for a syntax node that is not new: " +
                            entry.expression
                    );
                }
            }
        }
        writeStream.end();
    });
}

async function applyRemovedNodeTypes(
    removedNodeTypesForLanguage: Map<string, Set<string>>
): Promise<void> {
    const nodesToRemove: string[] = [];

    for (const [expressionName, expression] of expressionMappings) {
        const updatedLanguages: string[] = [];
        // Keep only languages for which the node type has not been removed from the language's grammar:
        for (let i = 0; i < expression.languages.length; i++) {
            const currentLangAbbr = expression.languages[i];
            if (!removedNodeTypesForLanguage.get(currentLangAbbr)?.has(expressionName)) {
                updatedLanguages.push(currentLangAbbr);
            } else {
                changelog.removedNodeFromLanguage(expression, currentLangAbbr);
                dlog(
                    'Expression "' +
                        expressionName +
                        '" was removed for language "' +
                        currentLangAbbr +
                        '".'
                );
                if (
                    expression.metrics.length > 0 &&
                    (expression.activated_for_languages === undefined ||
                        expression.activated_for_languages.includes(currentLangAbbr))
                ) {
                    console.warn(
                        '## Attention required! Language "' +
                            currentLangAbbr +
                            '" no longer includes the node type "' +
                            expressionName +
                            '", which was used for calculating the metric(s) ' +
                            expression.metrics +
                            ". You may have to add a new node of that language to the metric(s) in nodeTypesConfig.json. ##"
                    );
                }
            }
        }
        if (updatedLanguages.length === 0) {
            nodesToRemove.push(expressionName);
        }
        expression.languages = updatedLanguages;
    }

    // Make sure to write the change information before deleting any metric mapping.
    // If there is an error, catch that in the updateNodeMappings() and cancel the whole update.
    await writeChangelog();

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
