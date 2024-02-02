import { getCouplingMetrics, testFileMetrics } from "./TestHelper";
import { FileMetric } from "../../src/parser/metrics/Metric";

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

    describe("parses C# McCabeComplexity metric", () => {
        it("should count loops properly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "loops.cs",
                FileMetric.mcCabeComplexity,
                4
            );
        });

        it("should count if statements correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "if-statements.cs",
                FileMetric.mcCabeComplexity,
                11
            );
        });

        it("should not count any class declaration", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "classes.cs",
                FileMetric.mcCabeComplexity,
                0
            );
        });

        it("should count case but no default statements correctly", async () => {
            await testFileMetrics(
                csharpTestResourcesPath + "case-statements.cs",
                FileMetric.mcCabeComplexity,
                5
            );
        });
    });
});
