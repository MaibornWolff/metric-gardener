export interface MetricResult {
    metricName: string;
    metricValue: number;
}

export interface CouplingMetricValue {
    fromNamespace: string;
    toNamespace: string;
    fromSource: string;
    toSource: string;
    fromClassName: string;
    toClassName: string;
    usageType: string | "usage" | "extends" | "implements";
}

export interface CouplingMetricResult {
    relationships: CouplingMetricValue[];
    metrics: Map<string, { [key: string]: number }>;
}

export interface Metric {
    calculate(parseFile: ParseFile): MetricResult;
    getName(): string;
}

export interface CouplingMetric {
    calculate(files: ParseFile[]): CouplingMetricResult;
    getName(): string;
}

export interface ParseFile {
    language: string;
    filePath: string;
}
