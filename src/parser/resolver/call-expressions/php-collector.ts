import { AbstractCollector } from "./abstract-collector.js";

export class PHPCollector extends AbstractCollector {
    protected getAccessorsQuery(): string {
        return "";
    }
}
