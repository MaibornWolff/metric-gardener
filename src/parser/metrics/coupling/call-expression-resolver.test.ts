import { describe, expect, it } from "vitest";
import { type Relationship } from "../metric.js";
import { type UnresolvedCallExpression } from "../../resolver/call-expressions/abstract-collector.js";
import { type Accessor } from "../../resolver/accessors/abstract-collector.js";
import { getAdditionalRelationships } from "./call-expression-resolver.js";

describe("CallExpressionResolver", () => {
    describe("resolves call expressions and retrieves additional and transitive relationships", () => {
        it("when call expressions with save calls, public accessors and the right dependencies are given", () => {
            const firstItem: Relationship = {
                fromNamespace: "FirstItemNamespace.FirstItem",
                fromSource: "FirstItem",
                toSource: "SecondItem",
                toNamespace: "SecondItemNamespace.SecondItem",
                fromClassName: "FirstItem",
                toClassName: "SecondItem",
                usageType: "usage",
            };

            const secondItem: Relationship = {
                fromNamespace: "SecondItemNamespace.SecondItem",
                fromSource: "SecondItem",
                toSource: "ThirdItem",
                toNamespace: "ThirdItemNamespace.ThirdItem",
                fromClassName: "FirstItem",
                toClassName: "ThirdItem",
                usageType: "usage",
            };

            const thirdItem: Relationship = {
                fromNamespace: "ThirdItemNamespace.ThirdItem",
                fromSource: "ThirdItem",
                toSource: "FourthItem",
                toNamespace: "FourthItemNamespace.FourthItem",
                fromClassName: "FirstItem",
                toClassName: "FourthItem",
                usageType: "usage",
            };

            const dependencyTree = new Map<string, Relationship[]>();
            dependencyTree.set(firstItem.fromSource, [firstItem]);
            dependencyTree.set(secondItem.fromSource, [secondItem]);
            dependencyTree.set(thirdItem.fromSource, [thirdItem]);
            dependencyTree.set(thirdItem.toSource, []);

            const callExpression1: UnresolvedCallExpression = {
                name: "myVariable?.UnknownAccessor?.AccessorInSecondItem?.AccessorInThirdItem?",
                namespaceDelimiter: ".",
                variableNameIncluded: true,
            };

            const callExpression2: UnresolvedCallExpression = {
                name: "myVariable.AccessorInSecondItem",
                namespaceDelimiter: ".",
                variableNameIncluded: true,
            };

            const unresolvedCallExpressions = new Map<string, UnresolvedCallExpression[]>();
            unresolvedCallExpressions.set(firstItem.fromSource, [callExpression1, callExpression2]);

            const accessor1: Accessor = {
                filePath: "SecondItem",
                name: "AccessorInSecondItem",
                FQTNInfos: [
                    {
                        namespace: "SecondItemNamespace",
                        sourceFile: "SecondItem",
                        typeName: "SecondItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedFrom: [],
                    },
                ],
                returnType: "ThirdItem",
            };

            const accessor2: Accessor = {
                filePath: "ThirdItem",
                name: "AccessorInThirdItem",
                FQTNInfos: [
                    {
                        namespace: "ThirdItemNamespace",
                        sourceFile: "ThirdItem",
                        typeName: "ThirdItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedFrom: [],
                    },
                ],
                returnType: "FourthItem",
            };

            const publicAccessors = new Map<string, Accessor[]>();
            publicAccessors.set(accessor1.name, [accessor1]);
            publicAccessors.set(accessor2.name, [accessor2]);

            const additionalRelationships = getAdditionalRelationships(
                dependencyTree,
                unresolvedCallExpressions,
                publicAccessors,
                new Set<string>(),
            );

            expect(additionalRelationships).toMatchSnapshot();
        });
    });
});
