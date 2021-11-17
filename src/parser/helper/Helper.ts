export function getParseFile(filePath: string): undefined | ParseFile {
    if (filePath.includes(".")) {
        const extension = filePath.split(".").pop();
        return { language: extension.toLowerCase(), filePath: filePath };
    }
}

export function formatCaptures(tree, captures) {
    return captures.map((c) => {
        const node = c.node;
        delete c.node;
        c.text = tree.getText(node);
        return c;
    });
}
