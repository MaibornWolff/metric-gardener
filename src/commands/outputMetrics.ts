import fs from "fs";
import { Readable } from "stream";
import zlib from "zlib";

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

export function outputAsJson(
    fileMetrics: Map<string, Map<string, MetricResult>>,
    relationshipMetrics: CouplingMetricResult,
    outputFilePath: string,
    compress: boolean
) {
    const output = buildOutputObject(fileMetrics, relationshipMetrics);
    const outputString = JSON.stringify(output).toString();

    if (compress) {
        dumpCompressed(
            outputString,
            outputFilePath.endsWith(".gz") ? outputFilePath : outputFilePath + ".gz"
        );
    } else {
        fs.writeFileSync(outputFilePath, outputString);
    }

    console.log("Results saved to " + outputFilePath);
}

function buildOutputObject(
    fileMetrics: Map<string, Map<string, MetricResult>>,
    relationshipMetrics: CouplingMetricResult
) {
    const output: { nodes: OutputNode[]; relationships: OutputRelationship[] } = {
        nodes: [],
        relationships: [],
    };

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

    const couplingMetricResults = relationshipMetrics.metricValue || [];

    for (const couplingMetricResult of couplingMetricResults) {
        output.relationships.push({
            from: couplingMetricResult.fromSource,
            to: couplingMetricResult.toSource,
            metrics: { coupling: 100.0 },
        });
    }

    return output;
}

function dumpCompressed(outputString, outputFilePath) {
    const readableStream = new Readable();
    readableStream.push(outputString);
    readableStream.push(null);

    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputFilePath);
    readableStream.pipe(gzip).pipe(writeStream);
}
