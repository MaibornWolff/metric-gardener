import java.io.File
import java.io.IOException

fun main() {  // complexity +1
    try {
        File("thisfiledoesnotexist.txt").readText(Charsets.UTF_8)
        throw RuntimeException("lets throw a RuntimeException")
    } catch (exception: IOException) {  // complexity +1
        println(exception.message)
    } catch (exception: Exception) {  // complexity +1
        println(exception.message)
    } finally {
        println("finally")
    }
}
