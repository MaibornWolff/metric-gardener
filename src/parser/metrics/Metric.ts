export interface MetricResult {
    metricName: string;
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

export interface Metric {
    calculate(parseFile: ParseFile): MetricResult;
    getName(): string;
}

export interface CouplingMetric {
    calculate(files: ParseFile[]): CouplingResult;
    getName(): string;
}

/**
 * Represents a file to be parsed, including its path and programming language.
 */
export interface ParseFile {
    /**
     * Programming language of the file.
     */
    language: string;

    /**
     * Path to the file.
     */
    filePath: string;
}
