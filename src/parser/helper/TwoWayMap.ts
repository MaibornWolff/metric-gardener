/**
 * A map where there is also a mapping back from the value to the key.
 * Does only work properly if values are also unique and defined.
 * Read-only.
 */
export class ConstantTwoWayMap<Key, Value> {
    private readonly map: Map<Key, Value>;
    private readonly reverseMap: Map<Value, Key>;

    constructor(map: Map<Key, Value>) {
        this.map = map;
        this.reverseMap = new Map();
        for (const key of map.keys()) {
            const value = map.get(key);
            if (value !== undefined && !this.reverseMap.has(value)) {
                this.reverseMap.set(value, key);
            } else {
                throw new Error(
                    "Tried to use ConstantTwoWayMap with non-unique or undefined values."
                );
            }
        }
    }

    getValue(key: Key) {
        return this.map.get(key);
    }
    getKey(value: Value) {
        return this.reverseMap.get(value);
    }
}
