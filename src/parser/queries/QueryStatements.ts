import { Language, languageToAbbreviation } from "../helper/Language";

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

    activatedFor(language: Language): boolean {
        return true;
    }

    applicableFor(language: Language): boolean {
        return true;
    }

    toString(): string {
        return this.#query;
    }
}

export abstract class LanguageSpecificQueryStatement implements QueryStatementInterface {
    protected readonly activatedForLanguages: Set<Language>;
    protected readonly applicableForLanguages: Set<Language>;

    protected constructor(applicable_for_languages: string[], activated_for_languages?: string[]) {
        this.applicableForLanguages =
            languageToAbbreviation.getKeysForAllValues(applicable_for_languages);

        if (activated_for_languages !== undefined) {
            this.activatedForLanguages =
                languageToAbbreviation.getKeysForAllValues(activated_for_languages);
        } else {
            this.activatedForLanguages = new Set();
        }
    }

    activatedFor(language: Language): boolean {
        return this.activatedForLanguages.size === 0 || this.activatedForLanguages.has(language);
    }

    applicableFor(language: Language): boolean {
        return this.applicableForLanguages.has(language);
    }

    abstract toString(): string;
}

export class ExpressionQueryStatement extends LanguageSpecificQueryStatement {
    readonly #expression: string;

    constructor(
        expression: string,
        applicable_for_languages: string[],
        activated_for_languages?: string[]
    ) {
        super(applicable_for_languages, activated_for_languages);
        this.#expression = expression;
    }

    override toString(): string {
        return "(" + this.#expression + ") @" + this.#expression;
    }
}

export class OperatorQueryStatement extends LanguageSpecificQueryStatement {
    readonly #category: string;
    readonly #operator: string;

    constructor(
        category: string,
        operator: string,
        applicableForLanguages: string[],
        activatedForLanguages?: string[]
    ) {
        super(applicableForLanguages, activatedForLanguages);
        this.#category = category;
        this.#operator = operator;
    }

    override toString(): string {
        return "(" + this.#category + ' operator: "' + this.#operator + '") @operator_expression';
    }
}

export class SimpleLanguageSpecificQueryStatement extends LanguageSpecificQueryStatement {
    readonly #query: string;

    constructor(
        query: string,
        applicable_for_languages: string[],
        activated_for_languages?: string[]
    ) {
        super(applicable_for_languages, activated_for_languages);
        this.#query = query;
    }

    override toString(): string {
        return this.#query;
    }
}
