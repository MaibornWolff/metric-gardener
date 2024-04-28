class Test1 {}

class Test2 {}

class Test3 {}

abstract class Animal {
    constructor(protected name: string) { }

    // abstract_method_signature
    abstract makeSound(input : string) : string;

    move(meters) {
    }
}