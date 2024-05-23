import { type Language } from "../../helper/language.js";
import { type NodeTypeConfig } from "../../helper/model.js";

export type QueryStatement = {
    activatedFor(language: Language): boolean;

    /**
     * Tests whether this query is grammatically applicable for the specified programming language.
     * @param language The language to check.
     * @return true if the query is applicable, false if not.
     */
    applicableFor(language: Language): boolean;

    toString(): string;
};

export class SimpleQueryStatement implements QueryStatement {
    readonly #query: string;

    constructor(query: string) {
        this.#query = query;
    }

    activatedFor(): boolean {
        return true;
    }

    applicableFor(): boolean {
        return true;
    }

    toString(): string {
        return this.#query;
    }
}

export abstract class LanguageSpecificQueryStatement implements QueryStatement {
    protected readonly deactivatedForLanguages: Set<Language>;
    protected readonly applicableForLanguages: Set<Language>;

    constructor(
        applicable_for_languages: Set<Language>,
        deactivated_for_languages?: Set<Language>,
    ) {
        this.applicableForLanguages = new Set(applicable_for_languages);

        this.deactivatedForLanguages =
            deactivated_for_languages === undefined
                ? new Set()
                : new Set(deactivated_for_languages);
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
        applicable_for_languages = new Set<Language>(nodeType.languages),
        deactivated_for_languages: Set<Language> | undefined = new Set(
            nodeType.deactivated_for_languages,
        ),
    ) {
        const { type_name, grammar_type_name } = nodeType;
        super(applicable_for_languages, deactivated_for_languages);

        this.nodeTypeName = grammar_type_name ?? type_name;
    }

    override toString(): string {
        return "(" + this.nodeTypeName + ") @" + this.nodeTypeName;
    }
}

export class OperatorQueryStatement extends NodeTypeQueryStatement {
    readonly #operator: string;

    constructor(
        nodeType: NodeTypeConfig,
        applicable_for_languages = new Set<Language>(nodeType.languages),
        deactivated_for_languages: Set<Language> | undefined = new Set(
            nodeType.deactivated_for_languages,
        ),
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
        applicable_for_languages: Set<Language>,
        deactivated_for_languages?: Set<Language>,
    ) {
        super(applicable_for_languages, deactivated_for_languages);
        this.#query = query;
    }

    override toString(): string {
        return this.#query;
    }
}
