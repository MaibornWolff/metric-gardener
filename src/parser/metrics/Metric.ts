interface MetricResult {
    metricName: string;
    metricValue: number;
}

interface CouplingMetricValue {
    fromNamespace: string;
    toNamespace: string;
    fromSource: string;
    toSource: string;
    fromClassName: string;
    toClassName: string;
    usageType: string | "usage" | "extends" | "implements";
}

interface CouplingMetricResult {
    relationships: CouplingMetricValue[];
    metrics: Map<string, { [key: string]: number }>;
}

interface Metric {
    calculate(parseFile: ParseFile): MetricResult;
    getName(): string;
}

interface CouplingMetric {
    calculate(files: ParseFile[]): CouplingMetricResult;
    getName(): string;
}

interface ParseFile {
    language: string;
    filePath: string;
}
