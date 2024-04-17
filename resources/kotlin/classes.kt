class Empty

data class DataClass(val x: Int)

abstract class Polygon {
    abstract fun draw()
}

public class Rectangle : Polygon() {
    override fun draw() {
        println("¯\\_(ツ)_/¯")
    }
}

interface MyInterface {
    fun foo()
}

private class Child : MyInterface {
    override fun foo() {
        println("bar")
    }
}

open class OpenClass

internal class InternalClass

interface IntPredicate {
    fun accept(i: Int): Boolean
}
val isEven1 = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}
class A {
    inner class Inner
}
object DataProviderManager {
    fun registerDataProvider(provider: DataProvider) {
        // ...
    }
}
class MyClass {
    companion object : Factory<MyClass> {
        override fun create(): MyClass = MyClass()
    }
}
