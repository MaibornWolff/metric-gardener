import { FullyQTN } from "../AbstractCollector";
import { TreeParser } from "../../../helper/TreeParser";
import { QueryBuilder } from "../../../queries/QueryBuilder";
import { grammars } from "../../../helper/Grammars";
import { formatCaptures } from "../../../helper/Helper";
import { ParseFile } from "../../../metrics/Metric";

export class QueryStrategy {
    protected cache: Map<string, Map<string, FullyQTN>> = new Map();

    getFullyQTNs(parseFile: ParseFile, namespaceDelimiter, namespacesQuery): Map<string, FullyQTN> {
        const cachedItem = this.cache.get(parseFile.filePath);
        if (cachedItem !== undefined) {
            return cachedItem;
        }

        const namespaceDeclarations: Map<string, FullyQTN> = new Map();

        const tree = TreeParser.getParseTree(parseFile);

        const queryBuilder = new QueryBuilder(grammars.get(parseFile.language), tree);
        queryBuilder.setStatements([namespacesQuery]);

        const query = queryBuilder.build();
        const captures = query.captures(tree.rootNode);
        const textCaptures = formatCaptures(tree, captures);

        console.log("namespace definitions", parseFile.filePath, textCaptures);

        for (let index = 0; index < textCaptures.length; index += 1) {
            const namespaceName = textCaptures[index].text;

            // Jump to first class name or class type capture
            index++;
            let isInterface =
                textCaptures[index]?.name === "class_type" &&
                textCaptures[index]?.text === "interface";
            if (isInterface) {
                // Jump to class name capture
                index++;
            }
            let hasClassDeclaration = textCaptures[index]?.name === "class_name";

            while (hasClassDeclaration) {
                const className = textCaptures[index].text;
                const namespaceDeclaration: FullyQTN = {
                    namespace: namespaceName,
                    className: className,
                    classType: isInterface ? "interface" : "class",
                    source: parseFile.filePath,
                    namespaceDelimiter: namespaceDelimiter,
                    implementedClasses: [],
                };

                namespaceDeclarations.set(
                    namespaceName + namespaceDelimiter + className,
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
                    if (!namespaceDeclaration.implementedClasses.includes(implementedClassName)) {
                        namespaceDeclaration.implementedClasses.push(implementedClassName);
                    }

                    // Jump to next capture, no matter if implements class or any other
                    index++;
                    hasImplements = textCaptures[index]?.name === "implemented_class";
                }

                if (textCaptures[index]?.name === "namespace_definition_name") {
                    break;
                }

                isInterface =
                    textCaptures[index]?.name === "class_type" &&
                    textCaptures[index]?.text === "interface";
                if (isInterface) {
                    // Jump to class name capture
                    index++;
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
