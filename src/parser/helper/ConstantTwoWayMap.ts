/**
 * A map where there is also a mapping back from the value to the key.
 * Does only work properly if values are also unique and defined.
 * Read-only.
 */
export class ConstantTwoWayMap<KeyType, ValueType> {
    private readonly map: Map<KeyType, ValueType>;
    private readonly reverseMap: Map<ValueType, KeyType>;

    constructor(map: Map<KeyType, ValueType>) {
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

    getValueFor(key: KeyType) {
        return this.map.get(key);
    }
    getKeyFor(value: ValueType) {
        return this.reverseMap.get(value);
    }

    /**
     * Maps each key of the specified iterable to the corresponding value stored in this two-way map.
     * Calls the passed function for all mapped values, skipping elements for which there is no value available in the map.
     * @param iterable Iterable of elements to map.
     * @param callback Function to call with each retrieved values.
     */
    mapAllValuesFunctional(iterable: Iterable<KeyType>, callback: (value: ValueType) => any) {
        for (const key of iterable) {
            const mapResult = this.getValueFor(key);
            if (mapResult !== undefined) {
                callback(mapResult);
            }
        }
    }

    /**
     * Maps all values of the specified iterable to the corresponding key. Calls the passed function for all
     * reverse-mapped keys, skipping elements for which there is no key available in the map.
     * @param iterable Iterable of values to reverse-map.
     * @param callback Function to call with each retrieved key.
     */
    mapAllKeysFunctional(iterable: Iterable<ValueType>, callback: (key: KeyType) => any) {
        for (const value of iterable) {
            const mapResult = this.getKeyFor(value);
            if (mapResult !== undefined) {
                callback(mapResult);
            }
        }
    }
}
