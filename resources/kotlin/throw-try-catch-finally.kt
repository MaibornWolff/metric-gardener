import java.io.File
import java.io.IOException

fun main() {
    try {
        File("thisfiledoesnotexist.txt").readText(Charsets.UTF_8)
        throw RuntimeException("lets throw a RuntimeException")
    } catch (exception: IOException) {
        println(exception.message)
    } catch (exception: Exception) {
        println(exception.message)
    } finally {
        println("finally")
    }
}
