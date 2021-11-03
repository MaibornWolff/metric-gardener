interface Metric {
    calculate(parseFile: ParseFile);
}

interface ParseFile {
    language: string;
    filePath: string;
}
