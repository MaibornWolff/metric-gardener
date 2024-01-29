import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { getParserConfiguration, sortCouplingResults, getCouplingMetrics } from "./TestHelper";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const couplingResult = await getCouplingMetrics(
                csharpTestResourcesPath + "coupling-examples/"
            );
            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });
});
