import { debuglog, type DebugLoggerFunction } from "node:util";
import { type Query, type QueryCapture } from "tree-sitter";
import { getNameAndTextFromCaptures } from "../../../helper/helper.js";
import { type TypeInfo } from "../types/abstract-collector.js";

let dlog: DebugLoggerFunction = debuglog("metric-gardener", (logger) => {
    dlog = logger;
});
export type Accessor = {
    name: string;
    FQTN: FQTN;
    fromType: TypeInfo;
    filePath: string;
    returnType: string;
};

export abstract class AbstractCollector {
    getPublicAccessorsFromFile(
        filePath: string,
        typesFromFile: Map<FQTN, TypeInfo>,
    ): Map<string, Accessor[]> {
        const publicAccessorsMap = new Map<string, Accessor[]>();

        const accessorsQuery = this.getAccessorsQuery();
        if (accessorsQuery) {
            const publicAccessorsQuery = this.getAccessorsQuery();
            for (const [FQTN, typeInfo] of typesFromFile) {
                let publicAccessorsCaptures: QueryCapture[] = [];
                if (publicAccessorsQuery !== undefined) {
                    publicAccessorsCaptures = publicAccessorsQuery.captures(typeInfo.node!);
                }

                const accessorsTextCaptures = getNameAndTextFromCaptures(publicAccessorsCaptures);

                dlog("public accessors captures", accessorsTextCaptures);

                // First index must be the return type
                // Second index must be the accessor name
                for (let index = 0; index < accessorsTextCaptures.length; index += 1) {
                    const publicAccessor: Accessor = {
                        FQTN,
                        name: "",
                        fromType: typeInfo,
                        filePath,
                        returnType: accessorsTextCaptures[index].text,
                    };

                    index++;
                    publicAccessor.name = accessorsTextCaptures[index].text;
                    publicAccessor.FQTN += typeInfo.namespaceDelimiter + publicAccessor.name;

                    if (publicAccessorsMap.get(publicAccessor.name) === undefined) {
                        publicAccessorsMap.set(publicAccessor.name, []);
                    }

                    // TODO prevent duplicate adds by checking already existing combinations
                    //  of name, returnType, and filepath
                    publicAccessorsMap.get(publicAccessor.name)?.push(publicAccessor);
                }
            }
        }

        return publicAccessorsMap;
    }

    protected abstract getAccessorsQuery(): Query;
}
