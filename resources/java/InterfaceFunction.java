public interface MyInterface {
    // Abstract method in the interface
    void interfaceMethod();

    // Default method in the interface (introduced in Java 8)
    default void defaultMethod() {
        System.out.println("Default implementation in MyInterface");
    }