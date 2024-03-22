class FunctionsAndMethods {
    #age = 1;
    constructor() {}    // complexity +1

    testFunction1(x, y) {    // complexity +1
        return 1;
    }

    #testFunction2(x, y) {    // complexity +1
        return 1;
    }

    static #testFunction3() {    // complexity +1
        return 2;
    }
    get latest() {  // complexity +1
        return 3;
    }
    set latest(age) {   // complexity +1
        this.#age = age;
    }
    *more(){    // complexity +1
        let index = 0;
        while (true) {  // complexity +1
            yield index++;
    }
}
}

function testMethod() {}    // complexity +1

function outOfScope() {    // complexity +1
    return 3;
}

const myFunction = function myFunctionDefinition() {    // complexity +1
    return 42;
};

const x = (x, y) => x * y;    // complexity +1
