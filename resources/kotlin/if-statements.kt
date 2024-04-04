fun main() {
    val a = 2
    val b = 3

    var max = a
    if (a < b) max = b

    val x = true
    val y = false

    if (x && y) {
        max = a + b
    } else if (x || y) {
        max = a - b
    } else if (x) {
        max = a
    } else {
        max = b
    }

    // expression
    max = if (a > b) a else b

    // `else if` in expression
    val maxLimit = 1
    val maxOrLimit = if (maxLimit > a) maxLimit else if (a > b) a else b
}
