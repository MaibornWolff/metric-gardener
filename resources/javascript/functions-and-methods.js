class FunctionsAndMethods {
    #age = 1;
    constructor() {}

    testFunction1(x, y) {
        return 1;
    }

    #testFunction2(x, y) {
        return 1;
    }

    static #testFunction3() {
        return 2;
    }

    get latest() {
        return 3;
    }

    set latest(age) {
        this.#age = age;
    }

    *more() {
        let index = 0;

        while (true) {
            yield index++;
        }
    }
}

function testMethod() {}

function outOfScope() {
    return 3;
}

const myFunction = function myFunctionDefinition() {
    return 42;
};

const x = (x, y) => x * y;
