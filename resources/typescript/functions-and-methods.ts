class FunctionsAndMethods {
    constructor() {}

    public testFunction1(x: number, y: string): number {
        return 1;
    }

    testFunction2(x: number, y: string): number {
        return 1;
    }

    private testFunction3(): number {
        return 2;
    }

    public static staticMethod() {}
}

function testMethod() {}

function outOfScope(): number {
    return 3;
}

const myFunction = function myFunctionDefinition() {
    return 42;
};

const x = (x, y) => x * y;

interface KeyValueProcessor{ functionName(key: number, value: string): void; }

interface KeyValueProcessor{ (key: number, value: string): void; };

abstract class Animal {
    abstract makeSound(input : string) : string;
}