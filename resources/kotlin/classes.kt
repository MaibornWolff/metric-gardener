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
