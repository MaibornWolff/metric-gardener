import fs from "fs";

interface OutputNode {
    name: string;
    type: "File";
    metrics: { [key: string]: number };
}

interface OutputRelationship {
    from: string;
    to: string;
    metrics: {
        coupling: 100.0;
    };
}

const output: { nodes: OutputNode[]; relationships: OutputRelationship[] } = {
    nodes: [],
    relationships: [],
};

export function outputAsJson(
    fileMetrics: Map<string, Map<string, MetricResult>>,
    relationshipMetrics: CouplingMetricResult,
    outputFilePath: string
) {
    for (const [filePath, metricsMap] of fileMetrics.entries()) {
        const metrics: { [key: string]: number } = {};

        for (const [metricName, metricValue] of metricsMap.entries()) {
            metrics[metricName] = metricValue.metricValue;
        }

        output.nodes.push({
            name: filePath,
            type: "File",
            metrics: metrics,
        });
    }

    const couplingMetricResults = relationshipMetrics?.metricValue || [];

    for (const couplingMetricResult of couplingMetricResults) {
        output.relationships.push({
            from: couplingMetricResult.fromSource,
            to: couplingMetricResult.toSource,
            metrics: { coupling: 100.0 },
        });
    }

    fs.writeFile(outputFilePath, JSON.stringify(output, null, 4).toString(), function (err) {
        if (err) throw err;
        console.log("Results saved to " + outputFilePath);
    });
}
