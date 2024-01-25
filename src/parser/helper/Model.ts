import { Languages, languageToAbbreviation } from "./Languages";

export interface ExpressionMetricMapping {
    expression: string;
    metrics: string[];
    type: "statement" | "keyword";
    activated_for_languages?: string[];
    languages: string[];
    category: string;
    operator?: string;
}

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

export class ExpressionQueryStatement implements QueryStatementInterface {
    private expression: string;
    private activatedForLanguages: Set<Languages>;
    private applicableForLanguages: Set<Languages>;

    constructor(
        expression: string,
        applicable_for_languages: string[],
        activated_for_languages?: string[]
    ) {
        this.expression = expression;
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

    toQuery(): string {
        return "(" + this.expression + ") @" + this.expression;
    }
}

export class OperatorQueryStatement implements QueryStatementInterface {
    private activatedForLanguages: Set<Languages>;
    private expression: string;
    private category: string;
    private operator: string;
    private applicableForLanguages: Set<Languages>;

    constructor(
        category: string,
        operator: string,
        applicableForLanguages: string[],
        activatedForLanguages?: string[]
    ) {
        this.category = category;
        this.operator = operator;
        this.expression = category + ' operator: "' + operator + '"';
        this.applicableForLanguages =
            languageToAbbreviation.getKeysForAllValues(applicableForLanguages);

        if (activatedForLanguages !== undefined) {
            this.activatedForLanguages =
                languageToAbbreviation.getKeysForAllValues(activatedForLanguages);
        } else {
            this.activatedForLanguages = new Set();
        }
    }

    activatedFor(language: Languages): boolean {
        return this.activatedForLanguages.size === 0 || this.activatedForLanguages.has(language);
    }

    toQuery(): string {
        return "(" + this.category + ' operator: "' + this.operator + '") @binary_expression';
    }

    applicableFor(language: Languages): boolean {
        return this.applicableForLanguages.has(language);
    }
}
