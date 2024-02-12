import { Languages, languageToAbbreviation } from "./Languages";

export interface ExpressionMetricMapping {
    expression: string;
    metrics: string[];
    type: "statement" | "keyword";
    activated_for_languages?: string[];
    languages: string[];
    category: NodeTypeCategory;
    operator?: string;
}

export enum NodeTypeCategory {
    /**
     * Node types with no explicit category.
     */
    Other = "",
    /**
     * Node types that represent a binary expression.
     */
    BinaryExpression = "binary_expression",
    /**
     * Node types that are used for case labels in a switch-case-block.
     * May also be used for default labels by some language grammar(s).
     */
    CaseLabel = "case_label",
    /**
     * Node types that are exclusively used for default labels in a switch-case-block.
     */
    DefaultLabel = "default_label",
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

abstract class LanguageSpecificQueryStatement implements QueryStatementInterface {
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
