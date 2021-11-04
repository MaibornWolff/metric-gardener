interface MetricResult {
    metricName: string
    metricValue: number
}

interface Metric {
    calculate(parseFile: ParseFile): MetricResult;
}

interface ParseFile {
    language: string;
    filePath: string;
}
