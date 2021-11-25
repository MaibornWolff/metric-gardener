import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { TreeParser } from "../../helper/TreeParser";

export interface NamespaceReference {
    namespace: string;
    className: string;
    source: string;
    namespaceDelimiter: string;
}

export abstract class AbstractCollector {
    protected cache: Map<string, Map<string, NamespaceReference>> = new Map();

    protected abstract getNamespaceDelimiter(): string;
    protected abstract getNamespacesQuery(): string;

    /**
     * TODO scan interface, abstract class, and trait declarations as well (not only classes)
     */
    getNamespaces(parseFile: ParseFile): Map<string, NamespaceReference> {
        if (this.cache.has(parseFile.filePath)) {
            return this.cache.get(parseFile.filePath);
        }

        const packages: Map<string, NamespaceReference> = new Map();

        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getNamespacesQuery()]);

        const query = queryBuilder.build();
        const captures = query.captures(tree.rootNode);
        const textCaptures = formatCaptures(tree, captures);

        console.log(textCaptures);

        for (let index = 0; index < textCaptures.length; index += 1) {
            const namespaceName = textCaptures[index].text;

            let hasClassDeclaration = textCaptures[index + 1]?.name === "class_name";
            let classDeclarationIndex = index;

            while (hasClassDeclaration) {
                const className = textCaptures[classDeclarationIndex + 1].text;
                packages.set(namespaceName + this.getNamespaceDelimiter() + className, {
                    namespace: namespaceName,
                    className: className,
                    source: parseFile.filePath,
                    namespaceDelimiter: this.getNamespaceDelimiter(),
                });

                hasClassDeclaration =
                    textCaptures[classDeclarationIndex + 2]?.name === "class_name";
                classDeclarationIndex++;
                index++;
            }
        }

        this.cache.set(parseFile.filePath, packages);

        return packages;
    }
}
