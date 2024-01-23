import { ExpressionMetricMapping } from "../parser/helper/Model";
import fs from "fs";
import { EOL } from "os";

/**
 * Path to which the changelog is written.
 */
const pathToWriteChangelog = "./nodeTypeChanges.csv";

/**
 * Separator to use for writing a CSV-file of the changelog.
 */
const csvSeparator = ";";

/**
 * Escapes special characters in the passed string, so that it can be used as field inside a CSV-file.
 * @param s The string to escape.
 * @returns An escaped version of the string, without CSV special characters.
 */
export function escapeForCsv(s: string) {
    const escaped = s.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/"/g, '""');
    return '"' + escaped + '"';
}

/**
 * Tracks the changes that were applied while updating the node mappings.
 */
export class Changelog {
    private changelog = new Map<string, ChangelogEntry>();

    /**
     * Gets the changes for one node type.
     * @param nodeType
     */
    get(nodeType: string) {
        return this.changelog.get(nodeType);
    }

    /**
     * Gets access to the map of all changelog entries.
     */
    getAll() {
        return this.changelog;
    }

    /**
     * Clear the changelog.
     */
    clear() {
        this.changelog.clear();
    }

    /**
     * Logs that an expression was added to a language.
     * @param expression The expression.
     * @param languageAbbr Abbreviation of the language.
     */
    addedNodeToLanguage(expression: ExpressionMetricMapping, languageAbbr: string) {
        // There is no changelog entry for this expression yet, so create it.
        if (!this.changelog.has(expression.expression)) {
            this.changelog.set(
                expression.expression,
                new ChangelogEntry(
                    expression.expression,
                    false,
                    expression.languages,
                    [],
                    [],
                    expression.languages
                )
            );
        }
        this.changelog.get(expression.expression)?.addedToLanguage(languageAbbr);
    }

    /**
     * Logs that a totally new node type/expression was added to a language.
     * @param nodeTypeName Name of the node type.
     * @param languageAbbr Abbreviation of the language to which this node was added.
     */
    addedNewNode(nodeTypeName: string, languageAbbr: string) {
        const entry = new ChangelogEntry(nodeTypeName, true);
        entry.addedToLanguage(languageAbbr);
        this.changelog.set(nodeTypeName, entry);
    }

    /**
     * Logs that an expression was removed from a language.
     * @param expression The expression.
     * @param languageAbbr Abbreviation of the language.
     */
    removedNodeFromLanguage(expression: ExpressionMetricMapping, languageAbbr: string) {
        if (!this.changelog.has(expression.expression)) {
            this.changelog.set(
                expression.expression,
                new ChangelogEntry(
                    expression.expression,
                    false,
                    expression.languages,
                    [],
                    [],
                    expression.languages
                )
            );
        }
        this.changelog.get(expression.expression)?.removedFromLanguage(languageAbbr);
    }

    /**
     * Writes the changelog.
     * @param metricMappings The current mappings to inform the user about which metric(s)
     * are currently calculated with the changed syntax node(s).
     * @return Promise that fulfills once the changelog has been written successfully.
     */
    writeChangelog(metricMappings: Map<string, ExpressionMetricMapping>) {
        return new Promise<void>((resolve, reject) => {
            const writeStream = fs.createWriteStream(pathToWriteChangelog);

            writeStream.on("error", (err) => {
                console.error("Error while writing the changelog:");
                console.error(err);
                reject();
            });
            writeStream.on("finish", () => {
                console.log("####################################");
                console.log('Saved overview of all changes to "' + pathToWriteChangelog + '".');
                resolve();
            });

            writeStream.write("Changelog for updating the expression mappings" + EOL + EOL);
            writeStream.write("New syntax nodes:" + EOL + EOL);
            writeStream.write("Name:" + csvSeparator + "Added to language(s):" + EOL);

            for (const entry of this.getAll().values()) {
                if (entry.isNew) {
                    writeStream.write(
                        escapeForCsv(entry.expression) +
                            csvSeparator +
                            Array.from(entry.addedLanguages) +
                            EOL
                    );
                }
            }

            writeStream.write(EOL + "Removed syntax nodes:" + EOL + EOL);
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

            for (const entry of this.getAll().values()) {
                if (entry.remainingLanguages.size + entry.addedLanguages.size === 0) {
                    const mapping = metricMappings.get(entry.expression);
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
                        throw new Error(
                            "Programming mistake: No existing expression mapping for a syntax node that is not new: " +
                                entry.expression
                        );
                    }
                }
            }

            writeStream.write(
                EOL +
                    "Already known and still used syntax nodes which were removed from or added to some language(s):" +
                    EOL +
                    EOL
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

            for (const entry of this.getAll().values()) {
                if (
                    entry.remainingLanguages.size > 0 ||
                    (entry.addedLanguages.size > 0 && entry.removedLanguages.size > 0)
                ) {
                    const mapping = metricMappings.get(entry.expression);
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
                        throw new Error(
                            "Programming mistake: No existing expression mapping for a syntax node that is not new: " +
                                entry.expression
                        );
                    }
                }
            }
            writeStream.end();
        });
    }
}

/**
 * Tracks the changes that were applied to one expression.
 */
class ChangelogEntry {
    /**
     * Name of the expression.
     */
    expression: string;

    /**
     * Whether this is a totally new node that was not included in the mappings file before.
     */
    isNew: boolean;

    /**
     * Languages that included this node type before.
     */
    oldLanguages: Set<string>;

    /**
     * Languages from which this node type was removed.
     */
    removedLanguages: Set<string>;

    /**
     * Languages to which this node type was added.
     */
    addedLanguages: Set<string>;

    /**
     * Languages that include this node type and had included it before.
     */
    remainingLanguages: Set<string>;

    /**
     * Constructs a new changelog entry. Tracks the changes that were applied to one expression.
     * @param expression Name of the expression.
     * @param isNew Whether this is a totally new node that was not included in the mappings file before.
     * @param oldLanguages Languages that included this node type before.
     * @param removedLanguages Languages from which this node type was removed.
     * @param addedLanguages Languages to which this node type was added.
     * @param remainingLanguages Languages that include this node type and had included it before.
     */
    constructor(
        expression: string,
        isNew: boolean,
        oldLanguages: string[] = [],
        removedLanguages: string[] = [],
        addedLanguages: string[] = [],
        remainingLanguages: string[] = []
    ) {
        this.expression = expression;
        this.isNew = isNew;
        this.oldLanguages = new Set(oldLanguages);
        this.removedLanguages = new Set(removedLanguages);
        this.addedLanguages = new Set(addedLanguages);
        this.remainingLanguages = new Set(remainingLanguages);
    }

    /**
     * Logs that this expression was added to a language.
     * @param languageAbbr Abbreviation of the language to which this node was added.
     */
    addedToLanguage(languageAbbr: string) {
        this.addedLanguages.add(languageAbbr);
    }

    /**
     * Logs that this expression was removed from a language.
     * @param languageAbbr Abbreviation of the language from which this node was removed.
     */
    removedFromLanguage(languageAbbr: string) {
        this.removedLanguages.add(languageAbbr);
        this.remainingLanguages.delete(languageAbbr);
    }
}
