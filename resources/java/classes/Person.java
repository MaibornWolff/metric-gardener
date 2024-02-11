import java.util.Objects;

public record Person(String name, String address) {
    public Person(String name) {
        this(name, "Unknown");
    }
}
record Human (String name, String address) {
    public Human {
        Objects.requireNonNull(name);
        Objects.requireNonNull(address);
    }
}
record House(String address) {
}