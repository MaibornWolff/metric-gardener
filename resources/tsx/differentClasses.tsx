abstract class A {
    abstract m(): void;
}
class B extends A {
    m(): void {}
}
class C implements A {
    m(): void {}
}
class Foo {
    private y: number = 0;

    public getY(): number {
        return this.y;
    }
    static Bar = class {};
    public utilities = new (class {
        constructor(public superThis: Foo) {}
        public testSetOuterPrivate(target: number) {
            this.superThis.y = target;
        }
    })(this);
}
