import { Language, languageToAbbreviation } from "../helper/Language.js";
import { NodeTypeConfig } from "../helper/Model.js";

export interface QueryStatementInterface {
    activatedFor(language: Language): boolean;

    /**
     * Tests whether this query is grammatically applicable for the specified programming language.
     * @param language The language to check.
     * @return true if the query is applicable, false if not.
     */
    applicableFor(language: Language): boolean;

    toString(): string;
}

export class SimpleQueryStatement implements QueryStatementInterface {
    #query: string;

    constructor(query: string) {
        this.#query = query;
    }

    activatedFor(_language: Language): boolean {
        return true;
    }

    applicableFor(_language: Language): boolean {
        return true;
    }

    toString(): string {
        return this.#query;
    }
}

export abstract class LanguageSpecificQueryStatement implements QueryStatementInterface {
    protected readonly deactivatedForLanguages: Set<Language>;
    protected readonly applicableForLanguages: Set<Language>;

    protected constructor(
        applicable_for_languages: string[],
        deactivated_for_languages?: string[],
    ) {
        this.applicableForLanguages =
            languageToAbbreviation.getKeysForAllValues(applicable_for_languages);

        if (deactivated_for_languages !== undefined) {
            this.deactivatedForLanguages =
                languageToAbbreviation.getKeysForAllValues(deactivated_for_languages);
        } else {
            this.deactivatedForLanguages = new Set();
        }
    }

    activatedFor(language: Language): boolean {
        return !this.deactivatedForLanguages.has(language);
    }

    applicableFor(language: Language): boolean {
        return this.applicableForLanguages.has(language);
    }

    abstract toString(): string;
}

export class NodeTypeQueryStatement extends LanguageSpecificQueryStatement {
    protected readonly nodeTypeName: string;

    constructor(
        nodeType: NodeTypeConfig,
        applicable_for_languages: string[] = nodeType.languages,
        deactivated_for_languages: string[] | undefined = nodeType.deactivated_for_languages,
    ) {
        const { type_name, grammar_type_name } = nodeType;
        super(applicable_for_languages, deactivated_for_languages);

        if (grammar_type_name === undefined) {
            this.nodeTypeName = type_name;
        } else {
            this.nodeTypeName = grammar_type_name;
        }
    }

    override toString(): string {
        return "(" + this.nodeTypeName + ") @" + this.nodeTypeName;
    }
}

export class OperatorQueryStatement extends NodeTypeQueryStatement {
    readonly #operator: string;

    constructor(
        nodeType: NodeTypeConfig,
        applicable_for_languages: string[] = nodeType.languages,
        deactivated_for_languages: string[] | undefined = nodeType.deactivated_for_languages,
    ) {
        if (nodeType.operator === undefined) {
            throw new Error(
                "Tried to create a OperatorQueryStatement for the node type " +
                    nodeType.type_name +
                    " that has no operator.",
            );
        }

        super(nodeType, applicable_for_languages, deactivated_for_languages);
        this.#operator = nodeType.operator;
    }

    override toString(): string {
        return (
            "(" + this.nodeTypeName + ' operator: "' + this.#operator + '") @operator_expression'
        );
    }
}

export class SimpleLanguageSpecificQueryStatement extends LanguageSpecificQueryStatement {
    readonly #query: string;

    constructor(
        query: string,
        applicable_for_languages: string[],
        deactivated_for_languages?: string[],
    ) {
        super(applicable_for_languages, deactivated_for_languages);
        this.#query = query;
    }

    override toString(): string {
        return this.#query;
    }
}
