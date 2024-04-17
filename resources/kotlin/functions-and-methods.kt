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
    val x = fun(s: String): Int { return s.toIntOrNull() ?: 0 }
}
interface IndexedContainer {
    operator fun get(index: Int)
}
class OrdersList: IndexedContainer {
    override fun get(index: Int) { return 7 }
}
/*
functional interface can not be counted
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}*/
val isEven1 = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
val isEven2 = IntPredicate { it % 2 == 0 }
