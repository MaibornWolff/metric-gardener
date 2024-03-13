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
interface KeyValueProcessor
{
    (key: number, value: string): void;
};
/*
function addKeyValue(key:number, value:string):void {
    console.log('addKeyValue: key = ' + key + ', value = ' + value)
}

function updateKeyValue(key: number, value:string):void {
    console.log('updateKeyValue: key = '+ key + ', value = ' + value)
}

let kvp: KeyValueProcessor = addKeyValue;
kvp(1, 'Bill'); //Output: addKeyValue: key = 1, value = Bill

kvp = updateKeyValue;
kvp(2, 'Steve'); //Output: updateKeyValue: key = 2, value = Steve
*/