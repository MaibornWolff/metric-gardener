import * as fs from "node:fs";
import { Readable } from "node:stream";
import zlib from "node:zlib";
import {
    type CouplingResult,
    type FileMetricResults,
    type MetricError,
} from "../parser/metrics/metric.js";
import { FileType } from "../parser/helper/language.js";

type OutputNode = {
    name: string;
    type: string;
    metrics: Record<string, number>;
};

type OutputInfoNode = {
    name: string;
    type: string;
    message: string;
};

type OutputRelationship = {
    from: string;
    to: string;
    metrics: {
        coupling: 100;
    };
};

/**
 * Writes the passed metrics into a json file.
 * @param fileMetrics Metrics calculated on single files.
 * @param unsupportedFiles List of files that cannot be analyzed.
 * @param errorFiles List of files that could not be parsed at all.
 * @param relationshipMetrics Relationship metrics.
 * @param outputFilePath Path to write the file to
 * @param compress Whether the file should be compressed
 */
export function outputAsJson(
    fileMetrics: Map<string, FileMetricResults>,
    unsupportedFiles: string[],
    errorFiles: string[],
    relationshipMetrics: CouplingResult,
    outputFilePath: string,
    compress: boolean,
): void {
    const output = buildOutputObject(
        fileMetrics,
        unsupportedFiles,
        errorFiles,
        relationshipMetrics,
    );
    const outputString = JSON.stringify(output).toString();

    if (compress) {
        outputFilePath = outputFilePath.endsWith(".gz") ? outputFilePath : outputFilePath + ".gz";
        dumpCompressed(outputString, outputFilePath);
    } else {
        fs.writeFileSync(outputFilePath, outputString);
    }

    console.log("Results saved to " + outputFilePath);
}

function buildOutputObject(
    fileMetrics: Map<string, FileMetricResults>,
    unknownFiles: string[],
    errorFiles: string[],
    relationshipMetrics: CouplingResult,
): {
    nodes: OutputNode[];
    info: OutputInfoNode[];
    relationships: OutputRelationship[];
} {
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

    const metricErrorsPerFile = new Map<string, Iterable<MetricError>>();

    for (const [filePath, fileMetricResults] of fileMetrics.entries()) {
        const metrics: Record<string, number> = {};
        if (fileMetricResults.metricErrors.length > 0) {
            metricErrorsPerFile.set(filePath, fileMetricResults.metricErrors);
        }

        for (const metricResult of fileMetricResults.metricResults) {
            metrics[metricResult.metricName] = metricResult.metricValue;
        }

        const outputNode: OutputNode = {
            name: filePath,
            type: fileMetricResults.fileType,
            metrics,
        };

        outputNodeReferenceLookUp.set(filePath, outputNode);
        output.nodes.push(outputNode);
    }

    // Info for unknown file types
    for (const filePath of unknownFiles) {
        const outputNode: OutputInfoNode = {
            name: filePath,
            type: FileType.Unsupported,
            message: "Unknown language or file extension",
        };

        output.info.push(outputNode);
    }

    // Info when parsing the syntax tree failed
    for (const filePath of errorFiles) {
        const outputNode: OutputInfoNode = {
            name: filePath,
            type: FileType.Error,
            message: "Error while parsing a syntax tree for the file",
        };

        output.info.push(outputNode);
    }

    // Info when the calculation of (some) metrics failed
    for (const [filePath, metricErrors] of metricErrorsPerFile) {
        let message = "Error while calculating the following metric(s) for the file:";
        for (const metricError of metricErrors) {
            message += " " + metricError.metricName;
        }

        const outputNode: OutputInfoNode = {
            name: filePath,
            type: FileType.Error,
            message,
        };

        output.info.push(outputNode);
    }

    // Merge relationship metrics with existing nodes or add new node
    const couplingMetrics = relationshipMetrics.metrics.entries();
    for (const [filePath, metricsMap] of couplingMetrics) {
        const existingOutputNode = outputNodeReferenceLookUp.get(filePath);
        if (existingOutputNode === undefined) {
            const newOutputNode: OutputNode = {
                name: filePath,
                type: FileType.SourceCode,
                metrics: { ...metricsMap },
            };
            output.nodes.push(newOutputNode);
        } else {
            existingOutputNode.metrics = { ...existingOutputNode.metrics, ...metricsMap };
        }
    }

    const couplingMetricResults = relationshipMetrics.relationships;

    for (const couplingMetricResult of couplingMetricResults) {
        output.relationships.push({
            from: couplingMetricResult.fromSource,
            to: couplingMetricResult.toSource,
            metrics: { coupling: 100 },
        });
    }

    return output;
}

function dumpCompressed(outputString: string, outputFilePath: string): void {
    const readableStream = new Readable();
    readableStream.push(outputString);

    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputFilePath);
    readableStream.pipe(gzip).pipe(writeStream);
}
