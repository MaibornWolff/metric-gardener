import { Tree } from "tree-sitter";
import { Language } from "../helper/Language";

/**
 * Names of all available file metrics.
 */
export enum FileMetric {
    classes = "classes",
    commentLines = "comment_lines",
    functions = "functions",
    linesOfCode = "lines_of_code",
    complexity = "complexity",
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
     * @param parsedFile Parsed source code file for which the metric value should be calculated.
     * @return A MetricResult containing the calculated metric value.
     */
    calculate(parsedFile: ParsedFile): Promise<MetricResult>;

    /**
     * Returns the name of this metric.
     * @return The name of this metric.
     */
    getName(): string;
}

export interface CouplingMetric {
    calculate(files: ParsedFile[]): CouplingResult;
    getName(): string;
}

export abstract class SourceFile {
    /**
     * Path to the file.
     */
    filePath: string;

    /**
     * File extension of the file.
     */
    fileExtension: string;

    protected constructor(filePath: string, fileExtension: string) {
        this.filePath = filePath;
        this.fileExtension = fileExtension;
    }
}

/**
 * Represents a file written in an unsupported language.
 */
export class UnsupportedFile extends SourceFile {
    constructor(filePath: string, fileExtension: string) {
        super(filePath, fileExtension);
    }
}

/**
 * Represents a supported file to be analyzed for metrics, including its path, file extension, language and parsed syntax tree.
 */
export class ParsedFile extends SourceFile {
    /**
     * Programming language of the file.
     */
    language: Language;

    /**
     * Parsed syntax tree of the file.
     */
    tree: Tree;

    constructor(filePath: string, fileExtension: string, language: Language, tree: Tree) {
        super(filePath, fileExtension);
        this.language = language;
        this.tree = tree;
    }
}

export function isParsedFile(file: SourceFile): file is ParsedFile {
    return (file as ParsedFile).language !== undefined && (file as ParsedFile).tree !== undefined;
}
