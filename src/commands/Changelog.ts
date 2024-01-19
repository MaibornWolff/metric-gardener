import { ExpressionMetricMapping } from "../parser/helper/Model";

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
