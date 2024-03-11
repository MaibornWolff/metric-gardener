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
    /**
     * Node types that define the nesting level in structured text.
     */
    Nesting = "nesting",
}
