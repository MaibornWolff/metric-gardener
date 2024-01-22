import { AbstractCollector } from "./AbstractCollector";
import { PHPCollector } from "./PHPCollector";
import { CSharpCollector } from "./CSharpCollector";
import { ParseFile } from "../../metrics/Metric";

export class Factory {
    private collectors = new Map<string, AbstractCollector>();

    constructor() {
        this.collectors.set("cs", new CSharpCollector());
        this.collectors.set("php", new PHPCollector());
    }

    getCollector(parseFile: ParseFile): AbstractCollector | undefined {
        return this.collectors.get(parseFile.fileExtension);
    }
}
