import { describe, expect, it } from "vitest";
import { Relationship } from "../Metric";
import { getAdditionalRelationships } from "./CallExpressionResolver";
import { UnresolvedCallExpression } from "../../resolver/typeUsages/AbstractCollector";
import { Accessor } from "../../resolver/callExpressions/AbstractCollector";

describe("CallExpressionResolver", () => {
    describe("resolves call expressions and retrieves additional and transitive relationships", () => {
        it("when call expressions with save calls, public accessors and the right dependencies are given", () => {
            const firstItem: Relationship = {
                fromNamespace: "FirstItemNamespace.FirstItem",
                fromSource: "FirstItem",
                toSource: "SecondItem",
                toNamespace: "SecondItemNamespace.SecondItem",
                toClassName: "SecondItem",
                usageType: "usage",
            } as Relationship;

            const secondItem: Relationship = {
                fromNamespace: "SecondItemNamespace.SecondItem",
                fromSource: "SecondItem",
                toSource: "ThirdItem",
                toNamespace: "ThirdItemNamespace.ThirdItem",
                toClassName: "ThirdItem",
                usageType: "usage",
            } as Relationship;

            const thirdItem: Relationship = {
                fromNamespace: "ThirdItemNamespace.ThirdItem",
                fromSource: "ThirdItem",
                toSource: "FourthItem",
                toNamespace: "FourthItemNamespace.FourthItem",
                toClassName: "FourthItem",
                usageType: "usage",
            } as Relationship;

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
                namespaces: [
                    {
                        namespace: "SecondItemNamespace",
                        source: "SecondItem",
                        className: "SecondItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedClasses: [],
                    },
                ],
                returnType: "ThirdItem",
            };

            const accessor2: Accessor = {
                filePath: "ThirdItem",
                name: "AccessorInThirdItem",
                namespaces: [
                    {
                        namespace: "ThirdItemNamespace",
                        source: "ThirdItem",
                        className: "ThirdItem",
                        classType: "class",
                        namespaceDelimiter: ".",
                        implementedClasses: [],
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
