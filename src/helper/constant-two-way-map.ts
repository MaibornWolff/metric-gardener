/**
 * A map where there is also a mapping back from the value to the key.
 * Does only work properly if values are also unique and defined.
 * Read-only.
 */
export class ConstantTwoWayMap<KeyType, ValueType> {
    private readonly reverseMap: Map<ValueType, KeyType>;
    constructor(private readonly map: Map<KeyType, ValueType>) {
        this.reverseMap = new Map();
        for (const key of map.keys()) {
            const value = map.get(key);
            if (value !== undefined && !this.reverseMap.has(value)) {
                this.reverseMap.set(value, key);
            } else {
                throw new Error(
                    "Tried to use ConstantTwoWayMap with non-unique or undefined values.",
                );
            }
        }
    }

    getValueFor(key: KeyType): ValueType | undefined {
        return this.map.get(key);
    }

    getKeyFor(value: ValueType): KeyType | undefined {
        return this.reverseMap.get(value);
    }

    /**
     * Retrieves all corresponding keys for the values of the specified iterable.
     * Returns a set of all found keys.
     * @param iterable Iterable of values to reverse-map.
     */
    getKeysForAllValues(iterable: Iterable<ValueType> | undefined): Set<KeyType> {
        if(iterable === undefined) {
            return new Set();
        }

        const set = new Set<KeyType>();
        for (const value of iterable) {
            const retrievedKey = this.getKeyFor(value);
            if (retrievedKey !== undefined) {
                set.add(retrievedKey);
            }
        }

        return set;
    }
}
