import { countTransitiveImplements } from "./TransitiveImplementsCounter";
import { CouplingMetrics, Relationship } from "../Metric";

describe("TransitiveImplementsCounter", () => {
    describe("counts coupling for transitive implements", () => {
        it("when multiple exclusions are given", () => {
            const firstChainElement: Relationship = {
                fromSource: "ImplementingClass",
                toSource: "InterfaceLevel1",
                usageType: "implements",
            } as Relationship;

            const secondChainElement: Relationship = {
                fromSource: "InterfaceLevel1",
                toSource: "InterfaceLevel2",
                usageType: "implements",
            } as Relationship;

            const thirdChainElement: Relationship = {
                fromSource: "InterfaceLevel2",
                toSource: "InterfaceLevel3",
                usageType: "implements",
            } as Relationship;

            const otherFirstChainElement: Relationship = {
                fromSource: "ImplementingClass",
                toSource: "Helper3",
                usageType: "implements",
            } as Relationship;

            const otherImplementedInterface2: Relationship = {
                fromSource: "Helper3",
                toSource: "Helper4",
                usageType: "implements",
            } as Relationship;

            const otherRelationship1: Relationship = {
                fromSource: "ImplementingClass",
                toSource: "Helper1",
                usageType: "extends",
            } as Relationship;

            const otherRelationship2: Relationship = {
                fromSource: "InterfaceLevel1",
                toSource: "Helper2",
                usageType: "usage",
            } as Relationship;

            const couplingValues1: CouplingMetrics = {
                outgoing_dependencies: 1, // for own implements of Interface1
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
                implementsCount: 1,
            } as CouplingMetrics;

            const couplingValues2: CouplingMetrics = {
                outgoing_dependencies: 1, // for own implements of Interface2
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
                implementsCount: 1,
            } as CouplingMetrics;

            const couplingValues3: CouplingMetrics = {
                outgoing_dependencies: 1, // for own implements of Interface3
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
                implementsCount: 1,
            } as CouplingMetrics;

            const couplingValues4: CouplingMetrics = {
                outgoing_dependencies: 0,
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
                implementsCount: 1,
            } as CouplingMetrics;

            const otherCouplingValues: CouplingMetrics = {
                outgoing_dependencies: 0,
                incoming_dependencies: 0,
                coupling_between_objects: 0,
                instability: 0,
                implementsCount: 1,
            } as CouplingMetrics;

            const allCouplingMetrics = new Map([
                [firstChainElement.fromSource, couplingValues1],
                [secondChainElement.fromSource, couplingValues2],
                [thirdChainElement.fromSource, couplingValues3],
                [thirdChainElement.toSource, couplingValues4],

                [otherRelationship1.toSource, otherCouplingValues],
                [otherRelationship2.toSource, otherCouplingValues],

                [otherFirstChainElement.toSource, otherCouplingValues],
                [otherImplementedInterface2.toSource, otherCouplingValues],
            ]);

            const dependencyTree = new Map<string, Relationship[]>();
            dependencyTree.set(firstChainElement.fromSource, [
                firstChainElement,
                otherFirstChainElement,
            ]);
            dependencyTree.set(secondChainElement.fromSource, [secondChainElement]);
            dependencyTree.set(thirdChainElement.fromSource, [thirdChainElement]);
            dependencyTree.set(thirdChainElement.toSource, []);

            dependencyTree.set(otherImplementedInterface2.fromSource, [otherImplementedInterface2]);
            dependencyTree.set(otherImplementedInterface2.toSource, []);

            dependencyTree.set(otherRelationship1.toSource, []);
            dependencyTree.set(otherRelationship2.toSource, []);

            countTransitiveImplements(dependencyTree, allCouplingMetrics);

            expect(couplingValues1.outgoing_dependencies).toBe(4);
            expect(couplingValues2.outgoing_dependencies).toBe(2);
            expect(couplingValues3.outgoing_dependencies).toBe(1);
            expect(couplingValues4.outgoing_dependencies).toBe(0);

            expect(otherCouplingValues.outgoing_dependencies).toBe(0);
        });
    });
});
