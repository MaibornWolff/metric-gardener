import { AbstractCollector } from "./AbstractCollector";

export class PHPCollector extends AbstractCollector {
    protected getAccessorsQuery(): string {
        return "";
    }
}
