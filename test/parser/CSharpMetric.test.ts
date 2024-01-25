import fs from "fs";
import { GenericParser } from "../../src/parser/GenericParser";
import { getParserConfiguration, sortCouplingResults, testCouplingMetrics } from "./TestHelper";

describe("C# metric tests", () => {
    const csharpTestResourcesPath = "./resources/c-sharp/";

    describe("parsing C# dependencies", () => {
        it("should calculate the right dependencies and coupling metrics", async () => {
            await testCouplingMetrics(csharpTestResourcesPath + "coupling-examples/");
        }, 10000);
    });
});
