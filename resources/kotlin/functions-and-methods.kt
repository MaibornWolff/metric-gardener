import kotlin.math.abs
import kotlin.math.cos

fun main() {
    println("whats up")
}

open class Test(name: String) {

    private val hello: String = "hello"

    init {
        println(hello)
    }

    constructor(name: String, i: Int) : this(name) {
        println("Constructor $i")
    }

    fun someFunction(x: Int, y: Int) {
        println(x + y)
    }

    open fun someOpenFunction() {
        println("open for changes")
    }

    protected fun someProtectedFunction(i: Int): Int {
        return i
    }

    private val eps = 1E-10

    tailrec fun findFixPoint(x: Double = 1.0): Double = if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))

    infix fun Int.add(x: Int): Int {
        return this + x
    }

    // lambda
    val sum = { x: Int, y: Int -> x + y }

    fun doSomething(doSomethingElse: () -> Unit) {
        println("Doing something else")
        doSomethingElse()
    }

}
