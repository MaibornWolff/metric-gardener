export interface ExpressionMetricMapping {
    expression: string;
    metrics: string[];
    type: "statement" | "keyword";
    languages: string[];
    category: string;
    operator?: string;
}

export const binaryOperatorTranslations = new Map([
    ["&&", "logical_and"],
    ["||", "logical_or"],
    ["??", "null_or_value"],
    ["and", "and"],
    ["or", "or"],
    ["xor", "xor"],
]);
