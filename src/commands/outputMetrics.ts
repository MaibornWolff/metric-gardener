import fs from "fs";
import { Readable } from "stream";
import zlib from "zlib";
import { CouplingResult, MetricResult } from "../parser/metrics/Metric";

interface OutputNode {
    name: string;
    type: "File";
    metrics: {
        [key: string]: number;
    };
}

interface OutputInfoNode {
    name: string;
    type: "File";
    info: string;
}

interface OutputRelationship {
    from: string;
    to: string;
    metrics: {
        coupling: 100.0;
    };
}

/**
 * Writes the passed metrics into a json file.
 * @param fileMetrics Metrics calculated on single files.
 * @param unknownFiles List of files that cannot be analyzed.
 * @param relationshipMetrics Relationship metrics.
 * @param outputFilePath Path to write the file to
 * @param compress Whether the file should be compressed
 */
export function outputAsJson(
    fileMetrics: Map<string, Map<string, MetricResult>>,
    unknownFiles: string[],
    relationshipMetrics: CouplingResult,
    outputFilePath: string,
    compress: boolean
) {
    const output = buildOutputObject(fileMetrics, unknownFiles, relationshipMetrics);
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
    unknownFiles: string[],
    relationshipMetrics: CouplingResult
) {
    const output: {
        nodes: OutputNode[];
        info: OutputInfoNode[];
        relationships: OutputRelationship[];
    } = {
        nodes: [],
        info: [],
        relationships: [],
    };

    const outputNodeReferenceLookUp = new Map<string, OutputNode>();

    for (const [filePath, metricsMap] of fileMetrics.entries()) {
        const metrics = {};

        for (const [metricName, metricValue] of metricsMap.entries()) {
            metrics[metricName] = metricValue.metricValue;
        }

        const outputNode: OutputNode = {
            name: filePath,
            type: "File",
            metrics: metrics,
        };

        outputNodeReferenceLookUp.set(filePath, outputNode);
        output.nodes.push(outputNode);
    }

    for (const filePath of unknownFiles) {
        const outputNode: OutputInfoNode = {
            name: filePath,
            type: "File",
            info: "Unknown language or file extension",
        };

        output.info.push(outputNode);
    }

    // merge relationship metrics with existing nodes or add new node
    const couplingMetrics = relationshipMetrics.metrics?.entries() ?? [];
    for (const [filePath, metricsMap] of couplingMetrics) {
        const existingOutputNode = outputNodeReferenceLookUp.get(filePath);
        if (existingOutputNode !== undefined) {
            for (const couplingMetric of Object.keys(metricsMap)) {
                existingOutputNode.metrics[couplingMetric] = metricsMap[couplingMetric];
            }
        } else {
            const newOutputNode: OutputNode = {
                name: filePath,
                type: "File",
                metrics: {},
            };

            output.nodes.push(newOutputNode);

            for (const couplingMetric of Object.keys(metricsMap)) {
                newOutputNode.metrics[couplingMetric] = metricsMap[couplingMetric];
            }
        }
    }

    const couplingMetricResults = relationshipMetrics.relationships || [];

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
