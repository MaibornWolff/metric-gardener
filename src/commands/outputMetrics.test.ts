import { outputAsJson } from "./outputMetrics";
import fs from "fs";
import { Relationship, MetricResult, CouplingResult, MetricError } from "../parser/metrics/Metric";
import { FileType } from "../parser/helper/Language";

describe("outputMetrics", () => {
    describe("writes json into file ", () => {
        beforeEach(() => {
            jest.resetAllMocks();
            console.log = jest.fn();
        });

        it("when metrics are present", () => {
            const file1MetricResults = new Map<string, MetricResult>();
            file1MetricResults.set("metric1", { metricName: "metric1", metricValue: 42 });
            file1MetricResults.set("metric2", { metricName: "metric2", metricValue: 43 });

            const file2MetricResults = new Map<string, MetricResult>();
            file2MetricResults.set("metric1", { metricName: "metric1", metricValue: 44 });
            const file2MetricErrors = new Map<string, MetricError>();
            file2MetricErrors.set("metric2", { metricName: "metric2", error: new Error("Buh!") });

            const fileMetrics = new Map([
                [
                    "/file/path1.test",
                    {
                        fileType: FileType.SourceCode,
                        metricResults: file1MetricResults,
                        metricErrors: new Map(),
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

            const relationShipMetrics = {
                relationships: [
                    {
                        fromNamespace: "fromNamespace",
                        toNamespace: "toNamespace",
                        usageType: "usage",
                        fromSource: "/file/path2.test",
                        toSource: "/file/path1.test",
                    } as Relationship,
                ],
                metrics: new Map([
                    [
                        "/file/path2.test",
                        {
                            outgoing_dependencies: 3,
                            incoming_dependencies: 2,
                            instability: 0.6,
                        },
                    ],
                ]),
            } as CouplingResult;

            jest.spyOn(fs, "writeFileSync").mockImplementation((fileName, jsonString) => {
                expect(fileName).toBe("mocked-file.json");
                expect(jsonString).toMatchSnapshot();
            });

            outputAsJson(
                fileMetrics,
                unknownFiles,
                errorFiles,
                relationShipMetrics,
                "mocked-file.json",
                false,
            );
        });

        it("when no metrics are present", () => {
            const fileMetrics = new Map();
            const relationShipMetrics = {} as CouplingResult;

            outputAsJson(fileMetrics, [], [], relationShipMetrics, "mocked-file.json", false);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[],"info":[],"relationships":[]}',
            );
        });
    });
});
