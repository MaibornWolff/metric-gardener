import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { getParserConfiguration, sortCouplingResults } from "./TestHelper";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            const realInputPath = fs.realpathSync(csharpTestResourcesPath + "coupling-examples/");
            const parser = new GenericParser(getParserConfiguration(realInputPath, true, true));

            const results = await parser.calculateMetrics();
            const couplingResult = results.couplingMetrics;
            sortCouplingResults(couplingResult);

            expect(couplingResult).toMatchSnapshot();
        }, 10000);
    });
});
