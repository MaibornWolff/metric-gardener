import { outputAsJson } from "./outputMetrics";
import fs from "fs";

describe("outputMetrics", () => {
    describe("writes json into file ", () => {
        beforeEach(() => {
            jest.resetAllMocks();
            console.log = jest.fn();
        });

        it("when metrics are present", () => {
            const file1 = new Map<string, MetricResult>();
            file1.set("metric1", { metricName: "metric1", metricValue: 42 });
            file1.set("metric2", { metricName: "metric2", metricValue: 43 });

            const file2 = new Map<string, MetricResult>();
            file2.set("metric1", { metricName: "metric1", metricValue: 44 });
            file2.set("metric2", { metricName: "metric2", metricValue: 45 });

            const fileMetrics = new Map([
                ["/file/path1.test", file1],
                ["/file/path2.test", file1],
            ]);

            const relationShipMetrics = {
                metricName: "metric1",
                metricValue: [
                    {
                        fromNamespace: "fromNamespace",
                        toNamespace: "toNamespace",
                        usageType: "usage",
                        fromSource: "fromSource.xy",
                        toSource: "toSource.xy",
                    } as CouplingMetricValue,
                ],
            } as CouplingMetricResult;

            jest.spyOn(fs, "writeFileSync").mockImplementation((fileName, jsonString) => {
                expect(fileName).toBe("mocked-file.json");
                expect(jsonString).toMatchSnapshot();
            });

            outputAsJson(fileMetrics, relationShipMetrics, "mocked-file.json");
        });

        it("when no metrics are present", () => {
            const fileMetrics = new Map();
            const relationShipMetrics = {} as CouplingMetricResult;

            outputAsJson(fileMetrics, relationShipMetrics, "mocked-file.json");

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[],"relationships":[]}'
            );
        });
    });
});
