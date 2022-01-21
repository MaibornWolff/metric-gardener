import { AbstractCollector } from "./AbstractCollector";

export class PHPCollector extends AbstractCollector {
    protected getPublicAccessorsQuery(): string {
        return "";
    }
}
