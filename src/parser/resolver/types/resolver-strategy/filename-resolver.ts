import { type TypeInfo } from "../abstract-collector.js";

export class FileNameStrategy {
    getTypes(): Map<string, TypeInfo> {
        return new Map();
    }
}
