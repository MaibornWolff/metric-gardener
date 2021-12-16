import { outputAsJson } from "./outputMetrics";
import fs from "fs";

describe("outputMetrics", () => {
    describe("writes json into file ", () => {
        beforeEach(() => {
            jest.resetAllMocks();
            console.log = jest.fn();
        });

        it("when metrics are present", async () => {
            jest.spyOn(fs, "writeFile");

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

            await outputAsJson(fileMetrics, relationShipMetrics, "mocked-file.json");

            expect(fs.writeFile).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[{"name":"/file/path1.test","type":"File","metrics":{"metric1":42,"metric2":43}},{"name":"/file/path2.test","type":"File","metrics":{"metric1":42,"metric2":43}}],"relationships":[{"from":"fromSource.xy","to":"toSource.xy","metrics":{"coupling":100}}]}',
                expect.any(Function)
            );
        });

        it("when no metrics are present", async () => {
            jest.spyOn(fs, "writeFile");

            const fileMetrics = new Map();
            const relationShipMetrics = {} as CouplingMetricResult;

            await outputAsJson(fileMetrics, relationShipMetrics, "mocked-file.json");

            expect(fs.writeFile).toHaveBeenCalledWith(
                "mocked-file.json",
                '{"nodes":[],"relationships":[]}',
                expect.any(Function)
            );
        });
    });
});
