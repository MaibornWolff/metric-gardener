import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { outputAsJson } from "./outputMetrics.js";
import { MetricResult, CouplingResult, MetricError } from "../parser/metrics/Metric.js";
import { FileType } from "../parser/helper/Language.js";
import { mockConsole } from "../../test/metric-end-results/TestHelper.js";

const writeFileSync = vi.hoisted(() => vi.fn());
vi.mock("fs", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs")>();
    return { ...actual, writeFileSync };
});
describe("outputMetrics", () => {
    describe("writes json into file ", () => {
        beforeEach(() => {
            mockConsole();
        });

        afterAll(() => {
            vi.resetModules();
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

            expect(writeFileSync).toHaveBeenCalledTimes(1);
            const [file, data, options] = writeFileSync.mock.lastCall!;

            expect(file).toBe("mocked-file.json");
            expect(data).toMatchSnapshot();
            expect(options).toBeUndefined();
        });

        it("when no metrics are present", () => {
            const relationShipMetrics: CouplingResult = {
                relationships: [],
                metrics: new Map(),
            };

            outputAsJson(new Map(), [], [], relationShipMetrics, "mocked-file.json", false);

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith("Results saved to mocked-file.json");

            expect(writeFileSync).toHaveBeenCalledTimes(1);
            expect(writeFileSync).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[],"info":[],"relationships":[]}',
            );
        });
    });
});
