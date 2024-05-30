declare module "tree-sitter-type" {
    export type NodeType = {
        type: string;
        named: boolean;
        subtypes?: NodeType[];
        fields?: Record<string, any>;
        children?: {
            multiple: boolean;
            required: boolean;
            types: string[];
        };
    };

    export class LanguageNode {
        name: string;
        nodeTypeInfo: NodeType[];
        constructor(name: string, nodeTypeInfo: NodeType[]);
    }
}

declare module "tree-sitter-c-sharp" {
    import { type LanguageNode } from "tree-sitter-type";

    const CSharp: LanguageNode;
    export default CSharp;
}
declare module "tree-sitter-cpp" {
    import { type LanguageNode } from "tree-sitter-type";

    const CPlusPlus: LanguageNode;
    export default CPlusPlus;
}
declare module "tree-sitter-go" {
    import { type LanguageNode } from "tree-sitter-type";

    const GO: LanguageNode;
    export default GO;
}
declare module "tree-sitter-java" {
    import { type LanguageNode } from "tree-sitter-type";

    const Java: LanguageNode;
    export default Java;
}
declare module "tree-sitter-javascript" {
    import { type LanguageNode } from "tree-sitter-type";

    const JavaScript: LanguageNode;
    export default JavaScript;
}
declare module "tree-sitter-kotlin" {
    import { type LanguageNode } from "tree-sitter-type";

    const Kotlin: LanguageNode;
    export default Kotlin;
}
declare module "tree-sitter-php" {
    import { type LanguageNode } from "tree-sitter-type";

    export const php: LanguageNode;
    export const php_only: LanguageNode;
}
declare module "tree-sitter-python" {
    import { type LanguageNode } from "tree-sitter-type";

    const Python: LanguageNode;
    export default Python;
}
declare module "tree-sitter-ruby" {
    import { type LanguageNode } from "tree-sitter-type";

    const Ruby: LanguageNode;
    export default Ruby;
}
declare module "tree-sitter-rust" {
    import { type LanguageNode } from "tree-sitter-type";

    const Rust: LanguageNode;
    export default Rust;
}
declare module "tree-sitter-typescript" {
    import { type LanguageNode } from "tree-sitter-type";

    export const typescript: LanguageNode;
    export const tsx: LanguageNode;
}
declare module "tree-sitter-bash" {
    import { type LanguageNode } from "tree-sitter-type";

    const Bash: LanguageNode;
    export default Bash;
}
declare module "tree-sitter-c" {
    import { type LanguageNode } from "tree-sitter-type";

    const C: LanguageNode;
    export default C;
}
declare module "tree-sitter-json" {
    import { type LanguageNode } from "tree-sitter-type";

    const JSON: LanguageNode;
    export default JSON;
}
declare module "tree-sitter-yaml" {
    import { type LanguageNode } from "tree-sitter-type";

    const YAML: LanguageNode;
    export default YAML;
}
declare type FullyQualifiedName = string; // Fully qualified type name
declare type FilePath = string;
