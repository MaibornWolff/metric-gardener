class Empty

data class DataClass(val x: Int)

abstract class Polygon {
    abstract fun draw()  // complexity +1
}

public class Rectangle : Polygon() {
    override fun draw() {  // complexity +1
        println("¯\\_(ツ)_/¯")
    }
}

interface MyInterface {
    fun foo()  // complexity +1
}

private class Child : MyInterface {
    override fun foo() {  // complexity +1
        println("bar")
    }
}

open class OpenClass

internal class InternalClass
