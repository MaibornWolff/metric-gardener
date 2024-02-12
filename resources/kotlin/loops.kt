fun main() {  // complexity +1
    val collection = arrayOf("this", "is", "a", "collection")

    for (i in 1..3) {  // complexity +1
        for (item in collection) {  // complexity +1
            println(item)
        }
    }

    var x: Int = 10
    var z: Int = 11

    while (x > 0) {  // complexity +1
        x--
    }

    do {
        val y = z % 7
        z++
    } while (y != 0)  // complexity +1
}