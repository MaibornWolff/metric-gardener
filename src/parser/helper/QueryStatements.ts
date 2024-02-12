import { Languages, languageToAbbreviation } from "./Languages";

export interface QueryStatementInterface {
    activatedFor(language: Languages): boolean;

    /**
     * Tests whether this query is grammatically applicable for the specified programming language.
     * @param language The language to check.
     * @return true if the query is applicable, false if not.
     */
    applicableFor(language: Languages): boolean;

    toQuery(): string;
}

export class SimpleQueryStatement implements QueryStatementInterface {
    query: string;

    constructor(query: string) {
        this.query = query;
    }

    activatedFor(language: Languages): boolean {
        return true;
    }

    applicableFor(language: Languages): boolean {
        return true;
    }

    toQuery(): string {
        return this.query;
    }
}

export abstract class LanguageSpecificQueryStatement implements QueryStatementInterface {
    protected activatedForLanguages: Set<Languages>;
    protected applicableForLanguages: Set<Languages>;

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

    activatedFor(language: Languages): boolean {
        return this.activatedForLanguages.size === 0 || this.activatedForLanguages.has(language);
    }

    applicableFor(language: Languages): boolean {
        return this.applicableForLanguages.has(language);
    }

    abstract toQuery(): string;
}

export class ExpressionQueryStatement extends LanguageSpecificQueryStatement {
    private readonly expression: string;

    constructor(
        expression: string,
        applicable_for_languages: string[],
        activated_for_languages?: string[]
    ) {
        super(applicable_for_languages, activated_for_languages);
        this.expression = expression;
    }

    override toQuery(): string {
        return "(" + this.expression + ") @" + this.expression;
    }
}

export class OperatorQueryStatement extends LanguageSpecificQueryStatement {
    private readonly expression: string;
    private readonly category: string;
    private readonly operator: string;

    constructor(
        category: string,
        operator: string,
        applicableForLanguages: string[],
        activatedForLanguages?: string[]
    ) {
        super(applicableForLanguages, activatedForLanguages);
        this.category = category;
        this.operator = operator;
        this.expression = category + ' operator: "' + operator + '"';
    }

    override toQuery(): string {
        return "(" + this.category + ' operator: "' + this.operator + '") @operator_expression';
    }
}

export class SimpleLanguageSpecificQueryStatement extends LanguageSpecificQueryStatement {
    private readonly query: string;

    constructor(
        query: string,
        applicable_for_languages: string[],
        activated_for_languages?: string[]
    ) {
        super(applicable_for_languages, activated_for_languages);
        this.query = query;
    }

    override toQuery(): string {
        return this.query;
    }
}
