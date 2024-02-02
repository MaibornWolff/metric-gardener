import Parser from "tree-sitter";
import { Languages } from "../helper/Languages";

/**
 * Names of all available file metrics.
 */
export enum FileMetric {
    classes = "classes",
    commentLines = "comment_lines",
    functions = "functions",
    linesOfCode = "lines_of_code",
    mcCabeComplexity = "mcc",
    realLinesOfCode = "real_lines_of_code",
}

/**
 * Interface for carrying the result of a metric calculation.
 */
export interface MetricResult {
    /**
     * Name of the metric.
     */
    metricName: string;

    /**
     * Value of the metric.
     */
    metricValue: number;
}

export interface Relationship {
    fromNamespace: string;
    toNamespace: string;
    fromSource: string;
    toSource: string;
    fromClassName: string;
    toClassName: string;
    usageType: string | "usage" | "extends" | "implements";
}

export interface CouplingMetrics {
    outgoing_dependencies: number;
    incoming_dependencies: number;
    coupling_between_objects: number;
    instability: number;
}

export interface CouplingResult {
    relationships: Relationship[];
    metrics: Map<string, CouplingMetrics>;
}

/**
 * Interface for calculating a concrete metric.
 */
export interface Metric {
    /**
     * Calculates the metric value for the specified file.
     * @param parseFile Source code file for which the metric value should be calculated.
     * @param tree Syntax tree for the file.
     * @return A MetricResult containing the calculated metric value.
     */
    calculate(parseFile: ParseFile, tree: Parser.Tree): Promise<MetricResult>;

    /**
     * Returns the name of this metric.
     * @return The name of this metric.
     */
    getName(): string;
}

export interface CouplingMetric {
    calculate(files: ParseFile[]): CouplingResult;
    getName(): string;
}

/**
 * Represents a file to be parsed, including its path and the file extension.
 */
export interface ParseFile {
    /**
     * File extension of the file.
     */
    fileExtension: string;

    /**
     * Path to the file.
     */
    filePath: string;

    /**
     * Programming language of the file.
     */
    language: Languages;
}
