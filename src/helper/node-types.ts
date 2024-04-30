export type NodeTypes = NodeType[];

export type NodeType = {
    type: string;
    named: boolean;
    fields?: Fields;
    children?: Children;
    subtypes?: NodeType[];
};

type Fields = Record<string, Children>;

type Children = {
    multiple: boolean;
    required: boolean;
    types: NodeType[];
};
