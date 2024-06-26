import * as fs from "node:fs";
import { EOL } from "node:os";
import { type NodeTypeConfig } from "../helper/model.js";
import { type Language } from "../helper/language.js";

/**
 * Path to which the changelog is written.
 */
const pathToWriteChangelog = "./node-types-changes.csv";

/**
 * Separator to use for writing a CSV-file of the changelog.
 */
const csvSeparator = ";";

/**
 * Escapes special characters in the passed string, so that it can be used as field inside a CSV-file.
 * @param s The string to escape.
 * @returns An escaped version of the string, without CSV special characters.
 */
function escapeForCsv(s: string): string {
    const escaped = s.replaceAll("\n", "\\n").replaceAll("\r", "\\r").replaceAll('"', '""');
    return '"' + escaped + '"';
}

/**
 * Tracks the changes that were applied while importing the node types from the tree sitter grammars to
 * the current mappings between node type and metrics (node-types-config.json).
 */
export class NodeTypesChangelog {
    private readonly changelog = new Map<string, NodeTypesChangelogEntry>();

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
     * @param language The language
     */
    addedNodeToLanguage(nodeTypeConfig: NodeTypeConfig, language: Language): void {
        // There is no changelog entry for this node type yet, so create it.
        if (!this.changelog.has(nodeTypeConfig.type_name)) {
            this.changelog.set(
                nodeTypeConfig.type_name,
                new NodeTypesChangelogEntry(
                    nodeTypeConfig.type_name,
                    false,
                    new Set(nodeTypeConfig.languages),
                ),
            );
        }

        this.changelog.get(nodeTypeConfig.type_name)?.addedToLanguage(language);
    }

    /**
     * Logs that a totally new node type was added to a language.
     * @param nodeTypeName Name of the node type.
     * @param language The language to which this node was added.
     */
    addedNewNode(nodeTypeName: string, language: Language): void {
        const entry = new NodeTypesChangelogEntry(nodeTypeName, true);
        entry.addedToLanguage(language);
        this.changelog.set(nodeTypeName, entry);
    }

    /**
     * Logs that a node type was removed from a language.
     * Expected to be called directly before the change is applied to the node type config in order
     * to correctly track the difference to the old status of the mapping.
     * @param nodeTypeConfig The node type configuration, in the state before the change is applied.
     * @param language The language
     */
    removedNodeFromLanguage(nodeTypeConfig: NodeTypeConfig, language: Language): void {
        if (!this.changelog.has(nodeTypeConfig.type_name)) {
            this.changelog.set(
                nodeTypeConfig.type_name,
                new NodeTypesChangelogEntry(
                    nodeTypeConfig.type_name,
                    false,
                    new Set(nodeTypeConfig.languages),
                ),
            );
        }

        this.changelog.get(nodeTypeConfig.type_name)?.removedFromLanguage(language);
    }

    /**
     * Writes the changelog.
     * @param metricMappings The current mappings to inform the user about which metric(s)
     * are currently calculated with the changed syntax node(s).
     * @return Promise that fulfills once the changelog has been written successfully.
     */
    async writeChangelog(metricMappings: Map<string, NodeTypeConfig>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const writeStream = fs.createWriteStream(pathToWriteChangelog);

            writeStream.on("error", (error) => {
                reject(new Error("Error while writing the changelog:\n" + error.toString()));
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

    private writeNewNodes(writeStream: fs.WriteStream): void {
        writeStream.write("New syntax nodes:" + EOL + EOL);
        writeStream.write("Name:" + csvSeparator + "Added to language(s):" + EOL);

        for (const entry of this.changelog.values()) {
            if (entry.isNewNode) {
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        [...entry.addedLanguages].toString() +
                        EOL,
                );
            }
        }
    }

    private writeRemovedNodes(
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
                "Was explicitly deactivated for language(s):" +
                EOL,
        );

        for (const entry of this.changelog.values()) {
            if (entry.isRemovedNode()) {
                const mapping = metricMappings.get(entry.nodeTypeName)!;
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        [...entry.removedLanguages].toString() +
                        csvSeparator +
                        mapping.category +
                        csvSeparator +
                        (mapping.deactivated_for_languages ?? "").toString() +
                        EOL,
                );
            }
        }
    }

    private writeModifiedNodes(
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
                "Mapped to category:" +
                csvSeparator +
                "Was explicitly deactivated for language(s):" +
                EOL,
        );

        for (const entry of this.changelog.values()) {
            if (entry.isModifiedNode()) {
                const mapping = metricMappings.get(entry.nodeTypeName)!;
                writeStream.write(
                    escapeForCsv(entry.nodeTypeName) +
                        csvSeparator +
                        [...entry.addedLanguages].toString() +
                        csvSeparator +
                        [...entry.removedLanguages].toString() +
                        csvSeparator +
                        [...entry.remainingLanguages].toString() +
                        csvSeparator +
                        mapping.category +
                        csvSeparator +
                        (mapping.deactivated_for_languages ?? "").toString() +
                        EOL,
                );
            }
        }
    }
}

/**
 * Tracks the changes that were applied to the configuration of one node type due to changes
 * of the corresponding node type of the tree sitter grammars.
 */
class NodeTypesChangelogEntry {
    /**
     * Constructs a new changelog entry. Tracks the changes that were applied to one node type.
     * Expected to be created when the first change operation of one node type is to be performed.
     * @param nodeTypeName Name of the node type.
     * @param isNewNode Whether this is a totally new node that was not included in the mappings file before.
     * @param remainingLanguages Languages that include this node type and had included it before.
     * @param removedLanguages Languages from which this node type was removed.
     * @param addedLanguages Languages to which this node type was added.
     */
    constructor(
        public readonly nodeTypeName: string,
        public readonly isNewNode: boolean,
        public readonly remainingLanguages = new Set<string>(),
        public readonly removedLanguages = new Set<string>(),
        public readonly addedLanguages = new Set<string>(),
    ) {}

    /**
     * Logs that this node type was added to a language.
     * @param language The language to which this node was added.
     */
    addedToLanguage(language: Language): void {
        this.addedLanguages.add(language);
    }

    /**
     * Logs that this node type was removed from a language.
     * @param language The language from which this node was removed.
     */
    removedFromLanguage(language: Language): void {
        this.removedLanguages.add(language);
        this.remainingLanguages.delete(language);
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
