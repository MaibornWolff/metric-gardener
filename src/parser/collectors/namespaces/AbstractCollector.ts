import { QueryBuilder } from "../../queries/QueryBuilder";
import { grammars } from "../../helper/Grammars";
import { formatCaptures } from "../../helper/Helper";
import { TreeParser } from "../../helper/TreeParser";

export interface NamespaceReference {
    namespace: string;
    className: string;
    classType: string | "interface" | "class";
    source: string;
    namespaceDelimiter: string;
    extendedClass?: string;
    implementedClasses: string[];
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

        const namespaceDeclarations: Map<string, NamespaceReference> = new Map();

        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([this.getNamespacesQuery()]);

        const query = queryBuilder.build();
        const captures = query.captures(tree.rootNode);
        const textCaptures = formatCaptures(tree, captures);

        console.log(textCaptures);

        for (let index = 0; index < textCaptures.length; index += 1) {
            const namespaceName = textCaptures[index].text;

            // Jump to first class name or class type capture
            index++;
            const isInterface =
                textCaptures[index]?.name === "class_type" &&
                textCaptures[index]?.text === "interface";
            if (isInterface) {
                // Jump to class name capture
                index++;
            }
            let hasClassDeclaration = textCaptures[index]?.name === "class_name";

            while (hasClassDeclaration) {
                const className = textCaptures[index].text;
                const namespaceDeclaration: NamespaceReference = {
                    namespace: namespaceName,
                    className: className,
                    classType: isInterface ? "interface" : "class",
                    source: parseFile.filePath,
                    namespaceDelimiter: this.getNamespaceDelimiter(),
                    implementedClasses: [],
                };

                namespaceDeclarations.set(
                    namespaceName + this.getNamespaceDelimiter() + className,
                    namespaceDeclaration
                );

                // Jump to any next capture
                index++;
                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                if (textCaptures[index]?.name === "extended_class") {
                    namespaceDeclaration.extendedClass = textCaptures[index].text;
                    index++;
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                let hasImplements = textCaptures[index]?.name === "implemented_class";

                while (hasImplements) {
                    const implementedClassName = textCaptures[index].text;
                    namespaceDeclaration.implementedClasses.push(implementedClassName);

                    // Jump to next capture, no matter if implements class or any other
                    index++;
                    hasImplements = textCaptures[index]?.name === "implemented_class";
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                hasClassDeclaration = textCaptures[index]?.name === "class_name";
            }

            if (textCaptures[index]?.name === "namespace_definition_name") {
                index--;
            }
        }

        this.cache.set(parseFile.filePath, namespaceDeclarations);

        return namespaceDeclarations;
    }
}
