import fs from "fs";

interface CodeChartaNode {
    name: string;
    type: "File";
    attributes: { [key: string]: number };
    link: "";
    children: [];
}

interface CodeChartaEdge {
    fromNodeName: string;
    toNodeName: string;
    attributes: {
        coupling: 100.0;
    };
}

const output: { nodes: CodeChartaNode[]; edges: CodeChartaEdge[] } = { nodes: [], edges: [] };

export function outputAsJson(
    fileMetrics: Map<string, Map<string, MetricResult>>,
    edgeMetrics: CouplingMetricResult,
    outputFilePath: string,
    eraseFromPath: string
) {
    for (const [filePath, metricsMap] of fileMetrics.entries()) {
        const metrics: { [key: string]: number } = {};

        for (const [metricName, metricValue] of metricsMap.entries()) {
            metrics[metricName] = metricValue.metricValue;
        }

        // add manually to each node to enable edge metric for every node
        // this is CodeCharta specific
        metrics["coupling"] = 100;

        output.nodes.push({
            name: eraseFromPath?.length > 0 ? filePath.replace(eraseFromPath, "") : filePath,
            type: "File",
            attributes: metrics,
            link: "",
            children: [],
        });
    }

    const couplingMetricResults = edgeMetrics?.metricValue || [];

    for (const couplingMetricResult of couplingMetricResults) {
        output.edges.push({
            fromNodeName: couplingMetricResult.fromSource,
            toNodeName: couplingMetricResult.toSource,
            attributes: { coupling: 100.0 },
        });
    }

    fs.writeFile(outputFilePath, JSON.stringify(output, null, 4).toString(), function (err) {
        if (err) throw err;
        console.log("Results saved to " + outputFilePath);
    });
}
