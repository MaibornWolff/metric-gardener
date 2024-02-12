fun main() {  // complexity +1
    val x = 3

    when (x) {
        1 -> print("x == 1")  // complexity +1
        2 -> print("x == 2")  // complexity +1
        3, 4, 5 -> print("x is 3, 4 or 5")  // complexity +1
        else -> {
            print("x is mysterious")
        }
    }
}