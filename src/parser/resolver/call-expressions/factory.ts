import { Language } from "../../../helper/language.js";
import { type AbstractCollector } from "./abstract-collector.js";
import { PHPCollector } from "./php-collector.js";
import { CSharpCollector } from "./c-sharp-collector.js";

export class Factory {
    private readonly collectors = new Map<Language, AbstractCollector>();

    constructor() {
        this.collectors.set(Language.CSharp, new CSharpCollector());
        this.collectors.set(Language.PHP, new PHPCollector());
    }

    getCollector(language: Language): AbstractCollector | undefined {
        return this.collectors.get(language);
    }
}
