record House (String name, String address) {
    House(String name) {
        this(name, "Unknown");
    }
}
public record Person(String name, String address) {
    public Person {
        Objects.requireNonNull(name);
        Objects.requireNonNull(address);
    }

    public static Person unnamed(String address) {
        return new Person("Unnamed", address);
    }
}