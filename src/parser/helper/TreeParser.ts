import fs from "fs";
import { grammars } from "./Grammars";
import Parser, { Tree } from "tree-sitter";
import { Factory as NamespaceCollectorFactory } from "../collectors/namespaces/Factory";
import { Factory as UsageCollectorFactory } from "../collectors/usages/Factory";
import { NamespaceReference } from "../collectors/namespaces/AbstractCollector";
import { UsageReference } from "../collectors/usages/AbstractCollector";

export class TreeParser {
    private treeCache: Map<string, Tree> = new Map();
    private namespaceCollectorFactory = new NamespaceCollectorFactory(this);
    private usageCollectorFactory = new UsageCollectorFactory(this);

    getParseTree(parseFile: ParseFile): Tree {
        if (this.treeCache.has(parseFile.filePath)) {
            return this.treeCache.get(parseFile.filePath);
        }

        const parser = new Parser();
        parser.setLanguage(grammars.get(parseFile.language));

        const sourceCode = fs.readFileSync(parseFile.filePath).toString();
        const tree = parser.parse(sourceCode);
        this.treeCache.set(parseFile.filePath, tree);

        return tree;
    }

    getNamespaces(parseFile: ParseFile): Map<string, NamespaceReference> {
        const collector = this.namespaceCollectorFactory.getCollector(parseFile);
        return collector !== undefined ? collector.getNamespaces(parseFile) : new Map();
    }

    getUsages(parseFile: ParseFile, packages): UsageReference[] {
        const collector = this.usageCollectorFactory.getCollector(parseFile);
        return collector !== undefined ? collector.getUsages(parseFile, packages) : [];
    }
}
