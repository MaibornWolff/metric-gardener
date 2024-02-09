public record Person(String name, String address) {
    public Person(String name) {
        this(name, "Unknown");
    }
}
public record Mensch (String name, String address) {
    public Person {
        Objects.requireNonNull(name);
        Objects.requireNonNull(address);
    }
}
public record House(String address) {
}