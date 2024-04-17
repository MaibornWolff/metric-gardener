class Rectangle(val width: Int, val height: Int) {
    var stringRepresentation: String
        get() = this.toString()
        set(value) {
            println(value)
        }
    var setterVisibility: String = "abc"
        private set
}
