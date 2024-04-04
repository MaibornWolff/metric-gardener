fun main() {
    val collection = arrayOf("this", "is", "a", "collection")

    for (i in 1..3) {
        for (item in collection) {
            println(item)
        }
    }

    var x: Int = 10
    var z: Int = 11

    while (x > 0) {
        x--
    }

    do {
        val y = z % 7
        z++
    } while (y != 0)
}
