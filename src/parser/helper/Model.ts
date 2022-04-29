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
    activatedFor(fileExtension: string): boolean;
    toQuery(): string;
}

export class SimpleQueryStatement implements QueryStatementInterface {
    query: string;

    constructor(query: string) {
        this.query = query;
    }

    activatedFor(fileExtension: string): boolean {
        return true;
    }

    toQuery(): string {
        return this.query;
    }
}

export class ExpressionQueryStatement implements QueryStatementInterface {
    expression: string;
    activatedForLanguages: string[];

    constructor(expression: string, activated_for_languages?: string[]) {
        this.expression = expression;
        this.activatedForLanguages = activated_for_languages ?? [];
    }

    activatedFor(fileExtension: string): boolean {
        return (
            this.activatedForLanguages.length === 0 ||
            this.activatedForLanguages.includes(fileExtension)
        );
    }

    toQuery(): string {
        return "(" + this.expression + ") @" + this.expression;
    }
}

export class OperatorQueryStatement implements QueryStatementInterface {
    private activatedForLanguages: string[];
    private expression: string;
    private category: string;
    private operator: string;

    constructor(category: string, operator: string, activatedForLanguages?: string[]) {
        this.category = category;
        this.operator = operator;
        this.expression = category + ' operator: "' + operator + '"';
        this.activatedForLanguages = activatedForLanguages ?? [];
    }

    activatedFor(fileExtension: string): boolean {
        return (
            this.activatedForLanguages.length === 0 ||
            this.activatedForLanguages.includes(fileExtension)
        );
    }

    toQuery(): string {
        return (
            "(" +
            this.category +
            ' operator: "' +
            this.operator +
            '") @binary_expression_' +
            binaryOperatorTranslations.get(this.operator)
        );
    }
}

export const binaryOperatorTranslations = new Map([
    ["&&", "logical_and"],
    ["||", "logical_or"],
    ["??", "null_or_value"],
    ["and", "and"],
    ["or", "or"],
    ["xor", "xor"],
]);
