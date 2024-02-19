import { AbstractCollector } from "./AbstractCollector";
import { PHPCollector } from "./PHPCollector";
import { CSharpCollector } from "./CSharpCollector";
import { ParsedFile } from "../../metrics/Metric";
import { Language } from "../../helper/Language";

export class Factory {
    private collectors = new Map<Language, AbstractCollector>();

    constructor() {
        this.collectors.set(Language.CSharp, new CSharpCollector());
        this.collectors.set(Language.PHP, new PHPCollector());
    }

    getCollector(parsedFile: ParsedFile): AbstractCollector | undefined {
        return this.collectors.get(parsedFile.language);
    }
}
