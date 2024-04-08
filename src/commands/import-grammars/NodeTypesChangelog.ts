import { NodeTypeConfig } from "../../parser/helper/Model.js";
import * as fs from "fs";
import { EOL } from "os";

/**
 * Path to which the changelog is written.
 */
const pathToWriteChangelog = "./nodeTypesChanges.csv";

/**
 * Separator to use for writing a CSV-file of the changelog.
 */
const csvSeparator = ";";

/**
 * Escapes special characters in the passed string, so that it can be used as field inside a CSV-file.
 * @param s The string to escape.
 * @returns An escaped version of the string, without CSV special characters.
 */
export function escapeForCsv(s: string): string {
    const escaped = s.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/"/g, '""');
    return '"' + escaped + '"';
}

/**
 * Tracks the changes that were applied while importing the node types from the tree sitter grammars to
 * the current mappings between node type and metrics (nodeTypesConfig.json).
 */
export class NodeTypesChangelog {
    private changelog = new Map<string, NodeTypesChangelogEntry>();

    /**
     * Gets the changes for one node type.
     * @param nodeType
     */
    get(nodeType: string): NodeTypesChangelogEntry | undefined {
        return this.changelog.get(nodeType);
    }

    /**
     * Clear the changelog.
     */
    clear(): void {
        this.changelog.clear();
    }

    /**
     * Logs that a node type was added to a language.
     * Expected to be called directly before the change is applied to the node type config in order
     * to correctly track the difference to the old status of the mapping.
     * @param nodeTypeConfig The node type configuration, in the state before the change is applied.
     * @param languageAbbr Abbreviation of the language.
     */
    addedNodeToLanguage(nodeTypeConfig: NodeTypeConfig, languageAbbr: string): void {
        // There is no changelog entry for this node type yet, so create it.
        if (!this.changelog.has(nodeTypeConfig.type_name)) {
            this.changelog.set(
                nodeTypeConfig.type_name,
                new NodeTypesChangelogEntry(
                    nodeTypeConfig.type_name,
                    false,
                    nodeTypeConfig.languages,
                ),
            );
        }
        this.changelog.get(nodeTypeConfig.type_name)?.addedToLanguage(languageAbbr);
    }

    /**
     * Logs that a totally new node type was added to a language.
     * @param nodeTypeName Name of the node type.
     * @param languageAbbr Abbreviation of the language to which this node was added.
     */
    addedNewNode(nodeTypeName: string, languageAbbr: string): void {
        const entry = new NodeTypesChangelogEntry(nodeTypeName, true);
        entry.addedToLanguage(languageAbbr);
        this.changelog.set(nodeTypeName, entry);
    }

    /**
     * Logs that a node type was removed from a language.
     * Expected to be called directly before the change is applied to the node type config in order
     * to correctly track the difference to the old status of the mapping.
     * @param nodeTypeConfig The node type configuration, in the state before the change is applied.
     * @param languageAbbr Abbreviation of the language.
     */
    removedNodeFromLanguage(nodeTypeConfig: NodeTypeConfig, languageAbbr: string): void {
        if (!this.changelog.has(nodeTypeConfig.type_name)) {
            this.changelog.set(
                nodeTypeConfig.type_name,
                new NodeTypesChangelogEntry(
                    nodeTypeConfig.type_name,
                    false,
                    nodeTypeConfig.languages,
                ),
            );
        }
        this.changelog.get(nodeTypeConfig.type_name)?.removedFromLanguage(languageAbbr);
    }

    writeNewNodes(writeStream: fs.WriteStream): void {
        writeStream.write("New syntax nodes:" + EOL + EOL);
        writeStream.write("Name:" + csvSeparator + "Added to language(s):" + EOL);

        for (const entry of this.changelog.values()) {
            if (entry.isNewNode) {
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        Array.from(entry.addedLanguages).toString() +
                        EOL,
                );
            }
        }
    }

    writeRemovedNodes(
        writeStream: fs.WriteStream,
        metricMappings: Map<string, NodeTypeConfig>,
    ): void {
        writeStream.write("Removed syntax nodes:" + EOL + EOL);
        writeStream.write(
            "Name:" +
                csvSeparator +
                "Was present in language(s):" +
                csvSeparator +
                "Mapped to category:" +
                csvSeparator +
                "Was explicitly only activated for language(s):" +
                EOL,
        );

        for (const entry of this.changelog.values()) {
            if (entry.isRemovedNode()) {
                const mapping = metricMappings.get(entry.nodeTypeName);
                if (mapping === undefined) {
                    throw new Error(
                        "Programming mistake: No existing node type configuration for a syntax node type that is not new: " +
                            entry.nodeTypeName,
                    );
                }
                const activatedForLangOutput =
                    mapping.deactivated_for_languages === undefined
                        ? ""
                        : mapping.deactivated_for_languages;
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        Array.from(entry.removedLanguages).toString() +
                        csvSeparator +
                        mapping.category +
                        csvSeparator +
                        activatedForLangOutput.toString() +
                        EOL,
                );
            }
        }
    }

    writeModifiedNodes(
        writeStream: fs.WriteStream,
        metricMappings: Map<string, NodeTypeConfig>,
    ): void {
        writeStream.write(
            "Already known and still used syntax nodes which were removed from or added to some language(s):" +
                EOL +
                EOL,
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
                "Mapped to category::" +
                csvSeparator +
                "Was explicitly only activated for language(s):" +
                EOL,
        );

        for (const entry of this.changelog.values()) {
            if (entry.isModifiedNode()) {
                const mapping = metricMappings.get(entry.nodeTypeName);
                if (mapping === undefined) {
                    throw new Error(
                        "Programming mistake: No existing node type configuration for a syntax node type that is not new: " +
                            entry.nodeTypeName,
                    );
                }

                const activatedForLangOutput =
                    mapping.deactivated_for_languages === undefined
                        ? ""
                        : mapping.deactivated_for_languages;
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        Array.from(entry.addedLanguages).toString() +
                        csvSeparator +
                        Array.from(entry.removedLanguages).toString() +
                        csvSeparator +
                        Array.from(entry.remainingLanguages).toString() +
                        csvSeparator +
                        mapping.category +
                        csvSeparator +
                        activatedForLangOutput.toString() +
                        EOL,
                );
            }
        }
    }

    /**
     * Writes the changelog.
     * @param metricMappings The current mappings to inform the user about which metric(s)
     * are currently calculated with the changed syntax node(s).
     * @return Promise that fulfills once the changelog has been written successfully.
     */
    writeChangelog(metricMappings: Map<string, NodeTypeConfig>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const writeStream = fs.createWriteStream(pathToWriteChangelog);

            writeStream.on("error", (err) => {
                reject(new Error("Error while writing the changelog:\n" + err.toString()));
            });
            writeStream.on("finish", () => {
                console.log("####################################");
                console.log('Saved overview of all changes to "' + pathToWriteChangelog + '".');
                resolve();
            });

            writeStream.write("Changelog for updating the node types configuration" + EOL + EOL);

            this.writeNewNodes(writeStream);
            writeStream.write(EOL);

            this.writeRemovedNodes(writeStream, metricMappings);
            writeStream.write(EOL);

            this.writeModifiedNodes(writeStream, metricMappings);
            writeStream.end();
        });
    }
}

/**
 * Tracks the changes that were applied to the configuration of one node type due to changes
 * of the corresponding node type of the tree sitter grammars.
 */
class NodeTypesChangelogEntry {
    /**
     * Name of the node type.
     */
    nodeTypeName: string;

    /**
     * Whether this entry is for adding a totally new node type that was not included in the mappings file before.
     */
    isNewNode: boolean;

    /**
     * Languages from which the node type was removed.
     */
    removedLanguages: Set<string>;

    /**
     * Languages to which the node type was added.
     */
    addedLanguages: Set<string>;

    /**
     * Languages that include this node type and had included it before.
     */
    remainingLanguages: Set<string>;

    /**
     * Constructs a new changelog entry. Tracks the changes that were applied to one node type.
     * Expected to be created when the first change operation of one node type is to be performed.
     * @param nodeTypeName Name of the node type.
     * @param isNew Whether this is a totally new node that was not included in the mappings file before.
     * @param oldLanguages Languages that included this node type before.
     * @param removedLanguages Languages from which this node type was removed.
     * @param addedLanguages Languages to which this node type was added.
     */
    constructor(
        nodeTypeName: string,
        isNew: boolean,
        oldLanguages: string[] = [],
        removedLanguages: string[] = [],
        addedLanguages: string[] = [],
    ) {
        this.nodeTypeName = nodeTypeName;
        this.isNewNode = isNew;
        this.remainingLanguages = new Set(oldLanguages);
        this.removedLanguages = new Set(removedLanguages);
        this.addedLanguages = new Set(addedLanguages);
    }

    /**
     * Logs that this node type was added to a language.
     * @param languageAbbr Abbreviation of the language to which this node was added.
     */
    addedToLanguage(languageAbbr: string): void {
        this.addedLanguages.add(languageAbbr);
    }

    /**
     * Logs that this node type was removed from a language.
     * @param languageAbbr Abbreviation of the language from which this node was removed.
     */
    removedFromLanguage(languageAbbr: string): void {
        this.removedLanguages.add(languageAbbr);
        this.remainingLanguages.delete(languageAbbr);
    }

    /**
     * Checks whether the current state of this changelog entry indicates that the node type was removed from all languages.
     * @return true if the node was removed from all languages, false if not.
     */
    isRemovedNode(): boolean {
        return this.remainingLanguages.size + this.addedLanguages.size === 0;
    }

    /**
     * Checks whether the current state of this changelog entry indicates that the node type
     * is neither new nor removed from all languages, but added or removed to some languages.
     * @return true if this is a modified node, false otherwise.
     */
    isModifiedNode(): boolean {
        return !this.isNewNode && !this.isRemovedNode();
    }
}
