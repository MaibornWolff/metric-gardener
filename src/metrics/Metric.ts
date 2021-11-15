interface MetricResult {
    metricName: string;
    metricValue: number;
}

interface CouplingMetricValue {
    fromNamespace: string, toNamespace: string, fromSource: string, toSource: string
}

interface CouplingMetricResult {
    metricName: string;
    metricValue: CouplingMetricValue[];
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
