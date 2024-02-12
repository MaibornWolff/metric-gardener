import kotlin.math.abs
import kotlin.math.cos

fun main() {  // complexity +1
    println("whats up")
}

open class Test(name: String) {

    private val hello: String = "hello"

    init {  // complexity +1
        println(hello)
    }

    constructor(name: String, i: Int) : this(name) {  // complexity +1
        println("Constructor $i")
    }

    fun someFunction(x: Int, y: Int) {  // complexity +1
        println(x + y)
    }

    open fun someOpenFunction() {  // complexity +1
        println("open for changes")
    }

    protected fun someProtectedFunction(i: Int): Int {  // complexity +1
        return i
    }

    private val eps = 1E-10

    tailrec fun findFixPoint(x: Double = 1.0): Double = if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))  // complexity +2

    infix fun Int.add(x: Int): Int {  // complexity +1
        return this + x
    }

    // lambda
    val sum = { x: Int, y: Int -> x + y }  // complexity +1

    fun doSomething(doSomethingElse: () -> Unit) {  // complexity +1
        println("Doing something else")
        doSomethingElse()
    }

}