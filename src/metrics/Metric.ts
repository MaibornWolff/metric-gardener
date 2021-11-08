interface MetricResult {
    metricName: string;
    metricValue: number;
}

interface Metric {
    calculate(parseFile: ParseFile): MetricResult;
    getName(): string;
}

interface ParseFile {
    language: string;
    filePath: string;
}
