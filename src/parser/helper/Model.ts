/**
 * Configuration for a single syntax node type.
 * May maps a syntax node type to a category if it should be used to calculate a metric.
 */
export interface NodeTypeConfig {
    /**
     * Name of the node type. Usually equivalent to the name used in the tree-sitter grammar.
     */
    type_name: string;
    /**
     * Can be used to consider the node type only for a certain subset of the languages that have the node type.
     */
    activated_for_languages?: string[];
    /**
     * Languages that have the node type.
     */
    languages: string[];
    /**
     * Category of the node type.
     * This is used to put node types of different languages in a unified semantic category.
     */
    category: NodeTypeCategory;
    /**
     * Name of the node type in the tree-sitter grammar, if it is different to the type_name.
     */
    grammar_type_name?: string;
    /**
     * Operator of this node type, if any.
     */
    operator?: string;
}

export enum NodeTypeCategory {
    /**
     * Node types with no explicit category.
     */
    Other = "",
    /**
     * Node types that represent a logical binary expression, like "and" and "or".
     */
    LogicalBinaryExpression = "logical_binary_expression",
    /**
     * Node types that represent a binary expression that is no logical binary expression,
     * like addition or subtraction.
     */
    OtherBinaryExpression = "binary_expression",
    /**
     * Node type that represents a comment.
     */
    Comment = "comment",
    /**
     * Represents a function definition.
     */
    Function = "function",
    /**
     * Node types that define the nesting level in structured text.
     */
    Nesting = "nesting",

    // Language constructs that affect the control flow:

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
     * Represents if-statements, also including dedicated else-if-statements.
     */
    If = "if",
    /**
     * Represents loops.
     */
    Loop = "loop",
    /**
     * Represents catch blocks.
     */
    CatchBlock = "catch_block",
    /**
     * Represents other conditional expressions, like ternary operators.
     */
    Conditional = "conditional",

    // Classes, structs and similar constructs:

    /**
     * Represents a class definition.
     */
    ClassDefinition = "class_definition",
    /**
     * Represents an enum definition.
     */
    EnumDefinition = "enum_definition",
    /**
     * Represents a struct definition.
     */
    StructDefinition = "struct_definition",
    /**
     * Represents a record definition.
     */
    RecordDefinition = "record_definition",
    /**
     * Represents a union definition. For unions like in C and C++.
     */
    UnionDefinition = "c_union_definition",
    /**
     * Represents a trait definition.
     */
    TraitDefinition = "trait_definition",
    /**
     * Represents a interface definition.
     */
    InterfaceDefinition = "interface_definition",
}
