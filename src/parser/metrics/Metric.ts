import { Tree } from "tree-sitter";
import { FileType, Language, languageToFileType } from "../helper/Language.js";

/**
 * Names of all available file metrics.
 */
export type MetricName =
    | "classes"
    | "comment_lines"
    | "functions"
    | "lines_of_code"
    | "complexity"
    | "real_lines_of_code"
    | "max_nesting_level"
    | "keywords_in_comments"
    | "coupling";


/**
 * Interface for carrying the results of the metric calculations for a file.
 */
export interface FileMetricResults {
    fileType: FileType;
    metricResults: MetricResult[];
    metricErrors: MetricError[];
}

/**
 * Interface for carrying the result of a metric calculation.
 */
export interface MetricResult {
    /**
     * Name of the metric.
     */
    metricName: MetricName;

    /**
     * Value of the metric.
     */
    metricValue: number;
}

/**
 * Represents an error that occurred during the metric calculation process.
 */
export interface MetricError {
    metricName: MetricName;
    error: Error;
}

export interface Relationship {
    fromNamespace: string;
    toNamespace: string;
    fromSource: string;
    toSource: string;
    fromClassName: string;
    toClassName: string;
    usageType: UsageType;
}

export type UsageType = "usage" | "extends" | "implements";

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
    calculate(parsedFile: ParsedFile): MetricResult;

    /**
     * Returns the name of this metric.
     * @return The name of this metric.
     */
    getName(): MetricName;
}

export interface CouplingMetric {
    processFile(file: ParsedFile): void;

    calculate(): CouplingResult;

    getName(): MetricName;
}

export abstract class SourceFile {
    /**
     * Path to the file.
     */
    filePath: string;

    fileType: FileType;

    protected constructor(filePath: string, fileType: FileType) {
        this.filePath = filePath;
        this.fileType = fileType;
    }
}

/**
 * Represents a file written in an unsupported language.
 */
export class UnsupportedFile extends SourceFile {
    constructor(filePath: string) {
        super(filePath, FileType.Unsupported);
    }
}

/**
 * Represents a parsed file written in a supported language that can be analyzed for metrics.
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

    constructor(filePath: string, language: Language, tree: Tree) {
        const fileType = languageToFileType(language);
        super(filePath, fileType);
        this.language = language;
        this.tree = tree;
    }
}

export class ErrorFile extends SourceFile {
    /**
     * Error that occurred while processing the file.
     */
    error: Error;

    constructor(filePath: string, error: Error) {
        super(filePath, FileType.Error);
        this.error = error;
    }
}
