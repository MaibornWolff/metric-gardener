/*interface KeyValueProcessor
{
    (key: number, value: string): void;
};
const user = {
    id: 123,

    admin: false,
    becomeAdmin: function () {
        this.admin = true;
    },
};
class Circle {
    private _radius: number;

    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        if (value > 0) {
            this._radius = value;
        }
    }
}*/
/*type KeyValueProcessor = (key: number, value: string) => void;*/
interface KeyValueProcessor
{
    functionName(key: number, value: string): void;

};