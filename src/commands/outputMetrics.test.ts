import { beforeEach, describe, expect, it } from "vitest";
import { outputAsJson } from "./outputMetrics";
import { MetricResult, CouplingResult, MetricError } from "../parser/metrics/Metric";
import { FileType } from "../parser/helper/Language";
import { mockConsole, mockFs } from "../../test/metric-end-results/TestHelper";

describe("outputMetrics", () => {
    describe("writes json into file ", () => {
        let console: ReturnType<typeof mockConsole>;
        let fs: ReturnType<typeof mockFs>;

        beforeEach(() => {
            console = mockConsole();
            fs = mockFs();
        });

        it("when metrics are present", () => {
            const file1MetricResults: MetricResult[] = [];
            file1MetricResults.push({ metricName: "metric1", metricValue: 42 });
            file1MetricResults.push({ metricName: "metric2", metricValue: 43 });

            const file2MetricResults: MetricResult[] = [];
            file2MetricResults.push({ metricName: "metric1", metricValue: 44 });
            const file2MetricErrors: MetricError[] = [];
            file2MetricErrors.push({ metricName: "metric2", error: new Error("Buh!") });

            const fileMetrics = new Map([
                [
                    "/file/path1.test",
                    {
                        fileType: FileType.SourceCode,
                        metricResults: file1MetricResults,
                        metricErrors: [],
                    },
                ],
                [
                    "/file/path2.test",
                    {
                        fileType: FileType.SourceCode,
                        metricResults: file2MetricResults,
                        metricErrors: file2MetricErrors,
                    },
                ],
            ]);

            const unknownFiles = ["/file/path3.unknown", "/file/noExtension"];
            const errorFiles = ["/file/path4.error"];

            const relationShipMetrics: CouplingResult = {
                relationships: [
                    {
                        fromNamespace: "fromNamespace",
                        toNamespace: "toNamespace",
                        usageType: "usage",
                        fromSource: "/file/path2.test",
                        toSource: "/file/path1.test",
                        fromClassName: "ClassA",
                        toClassName: "ClassB",
                    },
                ],
                metrics: new Map([
                    [
                        "/file/path2.test",
                        {
                            outgoing_dependencies: 3,
                            incoming_dependencies: 2,
                            instability: 0.6,
                            coupling_between_objects: 2,
                        },
                    ],
                ]),
            };

            outputAsJson(
                fileMetrics,
                unknownFiles,
                errorFiles,
                relationShipMetrics,
                "mocked-file.json",
                false,
            );

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith("Results saved to mocked-file.json");

            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            const [file, data, options] = fs.writeFileSync.mock.lastCall!;
            expect(file).toBe("mocked-file.json");
            expect(data).toMatchSnapshot();
            expect(options).toBeUndefined();
        });

        it("when no metrics are present", () => {
            const relationShipMetrics: CouplingResult = { relationships: [], metrics: new Map() };

            outputAsJson(new Map(), [], [], relationShipMetrics, "mocked-file.json", false);

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith("Results saved to mocked-file.json");

            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[],"info":[],"relationships":[]}',
            );
        });
    });
});
