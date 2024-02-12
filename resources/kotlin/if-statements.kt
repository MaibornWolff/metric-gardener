fun main() {  // complexity +1
    val a = 2
    val b = 3

    var max = a
    if (a < b) max = b  // complexity +1

    val x = true
    val y = false

    if (x && y) {  // complexity +2
        max = a + b
    } else if (x || y) {  // complexity +2
        max = a - b
    } else if (x) {  // complexity +1
        max = a
    } else {
        max = b
    }

    // expression
    max = if (a > b) a else b  // complexity +1

    // `else if` in expression
    val maxLimit = 1
    val maxOrLimit = if (maxLimit > a) maxLimit else if (a > b) a else b  // complexity +2
}
