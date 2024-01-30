public class InitializationBlockExample {

    private String message;

    // initialization block
    {
        // Code inside this block is executed before any constructor
        System.out.println("Executing instance initialization block");
        message = "Hello, World!";
    }

    // Constructor
    public InitializationBlockExample() {
        System.out.println("Executing constructor");
    }
}