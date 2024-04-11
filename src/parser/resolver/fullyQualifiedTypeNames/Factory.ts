import { type ParsedFile } from "../../metrics/Metric.js";
import { Language } from "../../helper/Language.js";
import { type AbstractCollector } from "./AbstractCollector.js";
import { PHPCollector } from "./PHPCollector.js";
import { CSharpCollector } from "./CSharpCollector.js";

export class Factory {
    private readonly collectors = new Map<Language, AbstractCollector>();

    constructor() {
        this.collectors.set(Language.CSharp, new CSharpCollector());
        this.collectors.set(Language.PHP, new PHPCollector());
    }

    getCollector(parsedFile: ParsedFile): AbstractCollector | undefined {
        return this.collectors.get(parsedFile.language);
    }
}
