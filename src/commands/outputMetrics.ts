import fs from "fs";
import { Readable } from "stream";
import zlib from "zlib";
import { CouplingResult, FileMetricResults } from "../parser/metrics/Metric";
import { FileType } from "../parser/helper/Language";

interface OutputNode {
    name: string;
    type: string;
    metrics: {
        [key: string]: number;
    };
}

interface OutputInfoNode {
    name: string;
    type: string;
    message: string;
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
 * @param unsupportedFiles List of files that cannot be analyzed.
 * @param relationshipMetrics Relationship metrics.
 * @param outputFilePath Path to write the file to
 * @param compress Whether the file should be compressed
 */
export function outputAsJson(
    fileMetrics: Map<string, FileMetricResults>,
    unsupportedFiles: string[],
    relationshipMetrics: CouplingResult,
    outputFilePath: string,
    compress: boolean,
) {
    const output = buildOutputObject(fileMetrics, unsupportedFiles, relationshipMetrics);
    const outputString = JSON.stringify(output).toString();

    if (compress) {
        dumpCompressed(
            outputString,
            outputFilePath.endsWith(".gz") ? outputFilePath : outputFilePath + ".gz",
        );
    } else {
        fs.writeFileSync(outputFilePath, outputString);
    }

    console.log("Results saved to " + outputFilePath);
}

function buildOutputObject(
    fileMetrics: Map<string, FileMetricResults>,
    unknownFiles: string[],
    relationshipMetrics: CouplingResult,
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

    for (const [filePath, fileMetricResults] of fileMetrics.entries()) {
        const metrics = {};

        for (const [metricName, metricValue] of fileMetricResults.metricResults.entries()) {
            metrics[metricName] = metricValue.metricValue;
        }

        const outputNode: OutputNode = {
            name: filePath,
            type: fileMetricResults.fileType,
            metrics: metrics,
        };

        outputNodeReferenceLookUp.set(filePath, outputNode);
        output.nodes.push(outputNode);
    }

    for (const filePath of unknownFiles) {
        const outputNode: OutputInfoNode = {
            name: filePath,
            type: FileType.Unsupported,
            message: "Unknown language or file extension",
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
                type: FileType.SourceCode,
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
