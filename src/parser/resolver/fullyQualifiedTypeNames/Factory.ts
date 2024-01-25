import { AbstractCollector } from "./AbstractCollector";
import { PHPCollector } from "./PHPCollector";
import { CSharpCollector } from "./CSharpCollector";
import { ParseFile } from "../../metrics/Metric";
import { Languages } from "../../helper/Languages";

export class Factory {
    private collectors = new Map<Languages, AbstractCollector>();

    constructor() {
        this.collectors.set(Languages.CSharp, new CSharpCollector());
        this.collectors.set(Languages.PHP, new PHPCollector());
    }

    getCollector(parseFile: ParseFile): AbstractCollector | undefined {
        return this.collectors.get(parseFile.language);
    }
}
