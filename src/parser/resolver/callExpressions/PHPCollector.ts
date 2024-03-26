import { AbstractCollector } from "./AbstractCollector.js";

export class PHPCollector extends AbstractCollector {
    protected getAccessorsQuery(): string {
        return "";
    }
}
